export class GroqUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqUnavailableError";
  }
}

export type GroqStream = {
  model: string;
  stream: ReadableStream<Uint8Array>;
};

export async function openGroqStream(
  messages: { role: string; content: string }[],
  signal?: AbortSignal,
): Promise<GroqStream> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqUnavailableError("GROQ_API_KEY is not set in the environment.");
  }

  // Fallback to closest valid Groq Qwen model, or let Groq handle the string
  const model = "qwen/qwen3.8-27b"; 

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.2,
        top_p: 0.9,
      }),
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new GroqUnavailableError("Cannot reach Groq API. Please check your internet connection.");
  }

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new GroqUnavailableError(`Groq API returned ${res.status}. ${detail.slice(0, 200)}`.trim());
  }

  return { model: "Groq " + model, stream: res.body };
}
