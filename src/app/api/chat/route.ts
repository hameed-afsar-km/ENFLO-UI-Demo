import { buildLiveContext, type RuntimeContext } from "@/lib/assistant/context";
import {
  buildSystemPrompt,
  evaluateScope,
  looksOffTopic,
  OUT_OF_SCOPE_NOTICE,
} from "@/lib/assistant/knowledge";
import {
  OllamaUnavailableError,
  openChatStream,
  resolveModel,
  type OllamaChatMessage,
} from "@/lib/assistant/ollama";
import { openGroqStream, GroqUnavailableError } from "@/lib/assistant/groq";

const MAX_MESSAGE_LENGTH = 600;
const MAX_HISTORY_TURNS = 6;
const MAX_PREDICT_TOKENS = 400;

type IncomingMessage = { role: "user" | "assistant"; content: string };

type ChatRequestBody = {
  message?: string;
  history?: IncomingMessage[];
  context?: RuntimeContext;
  provider?: "groq" | "ollama";
};

const encoder = new TextEncoder();

function sse(payload: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

/** Strips Qwen3-style reasoning blocks and any leaked scratchpad. */
function sanitize(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .replace(/<\/?(?:think|thought|scratchpad)>/gi, "")
    .trim();
}

/**
 * Small models ignore "plain text only" instructions. Removing markdown after
 * the fact is cheaper than fighting it.
 */
function stripFormatting(text: string): string {
  return sanitize(text)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1$2")
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,;:!?])/g, "$1$2")
    .replace(/`(?:[^`\n]+)`/g, "$1")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[-–—]{1,2}\s*/, "")
    .trim();
}

/** A `num_predict` cut lands mid-sentence, so finish on a clean boundary. */
function normalizeAnswer(text: string): string {
  return clampToSentence(stripFormatting(text));
}

const MAX_ANSWER_CHARS = 700;

function clampToSentence(text: string): string {
  if (text.length <= MAX_ANSWER_CHARS) return text;

  const window = text.slice(0, MAX_ANSWER_CHARS);
  const lastStop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf(".\n"),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
  );

  if (lastStop > MAX_ANSWER_CHARS * 0.4) {
    return window.slice(0, lastStop + 1).trim();
  }

  const lastBreak = Math.max(window.lastIndexOf("\n"), window.lastIndexOf(". "));
  if (lastBreak > MAX_ANSWER_CHARS * 0.4) {
    return window.slice(0, lastBreak).trim();
  }

  return `${window.trim()}...`;
}
function coerceHistory(input: unknown): IncomingMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        typeof m === "object" &&
        "role" in m &&
        "content" in m &&
        ((m as IncomingMessage).role === "user" || (m as IncomingMessage).role === "assistant") &&
        typeof (m as IncomingMessage).content === "string",
    )
    .map((m) => ({
      role: m.role,
      content: m.content.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY_TURNS);
}

export async function POST(request: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return new Response("Message is required.", { status: 400 });
  }

  const trimmed = message.slice(0, MAX_MESSAGE_LENGTH);
  const history = coerceHistory(body.history);
  const runtimeContext = body.context ?? {};

  // ---- Layer 1: deterministic scope gate (no tokens spent) ----
  const verdict = evaluateScope(trimmed);

  if (verdict.kind === "refuse" || verdict.kind === "reply") {
    const payload: Record<string, unknown> = { type: "done", answer: verdict.message };
    if (verdict.kind === "refuse") payload.refused = verdict.category;
    return new Response(streamFrom([payload]), { headers: streamHeaders() });
  }

  // ---- Layer 2: grounded generation ----
  const liveContext = buildLiveContext(runtimeContext, trimmed);
  const systemPrompt = buildSystemPrompt(liveContext);

  const messages: OllamaChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content }) as OllamaChatMessage),
    { role: "user", content: trimmed },
  ];

  let model: string;
  let upstream: ReadableStream<Uint8Array>;
  let isGroq = body.provider === "groq";

  try {
    if (isGroq) {
      try {
        const opened = await openGroqStream(messages, request.signal);
        model = opened.model;
        upstream = opened.stream;
      } catch (err) {
        if (err instanceof GroqUnavailableError) {
          // Fallback to ollama
          isGroq = false;
          model = await resolveModel(request.signal);
          const opened = await openChatStream(model, messages, MAX_PREDICT_TOKENS, request.signal);
          model = opened.model;
          upstream = opened.stream;
        } else {
          throw err;
        }
      }
    } else {
      model = await resolveModel(request.signal);
      const opened = await openChatStream(model, messages, MAX_PREDICT_TOKENS, request.signal);
      model = opened.model;
      upstream = opened.stream;
    }
  } catch (error) {
    if (error instanceof OllamaUnavailableError || error instanceof GroqUnavailableError) {
      return new Response(streamFrom([{ type: "error", error: error.message }]), {
        status: 503,
        headers: streamHeaders(),
      });
    }
    throw error;
  }

  const guarded = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sse({ type: "meta", model }));
      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let raw = "";
      let emitted = 0;

      /**
       * Sanitising the *accumulated* text rather than each chunk keeps
       * inter-token spaces intact, while still hiding <think> blocks and
       * markdown emphasis as they arrive.
       */
      const flush = () => {
        const clean = stripFormatting(raw);
        if (clean.length <= emitted) {
          emitted = Math.min(emitted, clean.length);
          return;
        }
        const delta = clean.slice(emitted);
        emitted = clean.length;
        controller.enqueue(sse({ type: "delta", text: delta }));
      };

      const emitFinal = () => {
        const clean = normalizeAnswer(raw);
        const answer = clean.length === 0 || looksOffTopic(clean) ? OUT_OF_SCOPE_NOTICE : clean;
        controller.enqueue(sse({ type: "done", answer }));
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (!line) continue;

            let piece = "";
            let chunkError = "";

            if (isGroq) {
              if (line === "data: [DONE]") continue;
              if (line.startsWith("data: ")) {
                try {
                  const chunk = JSON.parse(line.slice(6));
                  if (chunk.choices?.[0]?.delta?.content) {
                    piece = chunk.choices[0].delta.content;
                  }
                  if (chunk.error) chunkError = chunk.error.message || chunk.error;
                } catch {
                  continue;
                }
              }
            } else {
              try {
                const chunk = JSON.parse(line);
                if (chunk.error) chunkError = chunk.error;
                piece = chunk.message?.content ?? "";
              } catch {
                continue;
              }
            }

            if (chunkError) {
              controller.enqueue(sse({ type: "error", error: chunkError }));
              controller.close();
              return;
            }

            if (piece) {
              raw += piece;
              flush();
            }
          }
        }

        emitFinal();
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          controller.enqueue(sse({ type: "error", error: "Lost connection to the local model." }));
        } else {
          emitFinal();
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(guarded, { headers: streamHeaders() });
}

function streamHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function streamFrom(payloads: Array<Record<string, unknown>>): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const payload of payloads) controller.enqueue(sse(payload));
      controller.close();
    },
  });
}

export async function GET(): Promise<Response> {
  try {
    const model = await resolveModel();
    return Response.json({ ok: true, model, host: process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434" });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Ollama unavailable" },
      { status: 503 },
    );
  }
}
