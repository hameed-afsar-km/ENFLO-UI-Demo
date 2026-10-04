const OLLAMA_HOST = (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(/\/$/, "");

/**
 * Preference order, best quality-per-byte first. Every candidate is already
 * pulled locally, so the assistant never triggers a multi-GB download.
 * Override with OLLAMA_MODEL.
 */
const MODEL_PREFERENCE = [
  "llama3.2:3b", // 2.0 GB - best grounding and brevity at this size
  "qwen2.5:1.5b", // 986 MB - smaller fallback, verbose but accurate
  "gemma2:2b", // 1.6 GB - accurate but noticeably slower
  "qwen3:1.7b",
  "qwen3:0.6b", // 522 MB - ultra light last resort
  "llama3.2:1b",
  "tinyllama",
];

const CHAT_TIMEOUT_MS = 120_000;
const TAG_CACHE_MS = 60_000;

export type OllamaChatMessage = { role: "system" | "user" | "assistant"; content: string };

type TagCache = { at: number; names: string[] } | null;

let tagCache: TagCache = null;

export class OllamaUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OllamaUnavailableError";
  }
}

function hasReasoningTemplate(name: string): boolean {
  return /^qwen3/i.test(name);
}

async function fetchInstalledModels(signal?: AbortSignal): Promise<string[]> {
  if (tagCache && Date.now() - tagCache.at < TAG_CACHE_MS) {
    return tagCache.names;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`tags ${res.status}`);
    const data = (await res.json()) as { models?: Array<{ name?: string; model?: string }> };
    const names = (data.models ?? [])
      .map((m) => m.name ?? m.model)
      .filter((n): n is string => typeof n === "string");
    tagCache = { at: Date.now(), names };
    return names;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function resolveModel(signal?: AbortSignal): Promise<string> {
  const override = process.env.OLLAMA_MODEL?.trim();
  if (override) return override;

  let installed: string[];
  try {
    installed = await fetchInstalledModels(signal);
  } catch {
    throw new OllamaUnavailableError(
      `Cannot reach Ollama at ${OLLAMA_HOST}. Start it with "ollama serve".`,
    );
  }

  for (const candidate of MODEL_PREFERENCE) {
    const match = installed.find((name) => name === candidate || name.startsWith(`${candidate.split(":")[0]}:`));
    if (match) return match;
  }

  const lightweight = installed
    .filter((name) => !/(ocr|llava|embed|minilm|mxbai)/i.test(name))
    .filter((name) => {
      const size = /:(\d+)b$/i.exec(name)?.[1];
      return size ? Number(size) <= 4 : false;
    })
    .sort();

  const fallback = lightweight[0] ?? installed.find((n) => !/(ocr|llava|embed|minilm|mxbai)/i.test(n));

  if (!fallback) {
    throw new OllamaUnavailableError(
      `No chat model found in Ollama. Pull one with: ollama pull ${MODEL_PREFERENCE[0]}`,
    );
  }

  return fallback;
}

function buildOptions(model: string, numPredict: number) {
  const base: Record<string, number> = {
    temperature: 0.2,
    top_p: 0.9,
    repeat_penalty: 1.12,
    num_predict: numPredict,
    num_ctx: 4096,
  };
  // Qwen3 emits <think> blocks by default, which wastes tokens and leaks
  // reasoning into the chat bubble.
  if (hasReasoningTemplate(model)) base.think = 0 as unknown as number;
  return base;
}

export type ChatTurnResult = {
  model: string;
  text: string;
};

/**
 * Single non-streaming call. Used as the post-stream safety net: if a small
 * model ignores the scope rules, the drift check replaces the answer.
 */
export async function completeOnce(
  model: string,
  messages: OllamaChatMessage[],
  numPredict: number,
  signal?: AbortSignal,
): Promise<ChatTurnResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        keep_alive: "30m",
        options: buildOptions(model, numPredict),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new OllamaUnavailableError(
        `Ollama returned ${res.status}. ${detail.slice(0, 200)}`.trim(),
      );
    }

    const data = (await res.json()) as { message?: { content?: string } };
    return { model, text: (data.message?.content ?? "").trim() };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export type OllamaStream = {
  model: string;
  stream: ReadableStream<Uint8Array>;
};

/**
 * Opens a streaming chat. Returns the raw NDJSON body so the route can pipe
 * tokens straight through without buffering the whole answer.
 */
export async function openChatStream(
  model: string,
  messages: OllamaChatMessage[],
  numPredict: number,
  signal?: AbortSignal,
): Promise<OllamaStream> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      cache: "no-store",
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        keep_alive: "30m",
        options: buildOptions(model, numPredict),
      }),
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new OllamaUnavailableError(
      `Cannot reach Ollama at ${OLLAMA_HOST}. Start it with "ollama serve".`,
    );
  }

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new OllamaUnavailableError(
      `Ollama returned ${res.status}. ${detail.slice(0, 200)}`.trim(),
    );
  }

  return { model, stream: res.body };
}

export async function isOllamaUp(signal?: AbortSignal): Promise<boolean> {
  try {
    await fetchInstalledModels(signal);
    return true;
  } catch {
    return false;
  }
}
