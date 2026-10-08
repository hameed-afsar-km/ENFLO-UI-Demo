"use client";

import { useCallback, useRef, useState } from "react";
import type { RuntimeContext } from "@/lib/assistant/context";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  refused?: boolean;
  error?: boolean;
  model?: string;
};

type StreamEvent =
  | { type: "meta"; model?: string; gated?: boolean }
  | { type: "delta"; text: string }
  | { type: "done"; answer: string; refused?: string }
  | { type: "error"; error: string };

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseSseBlock(block: string): StreamEvent | null {
  const dataLine = block
    .split("\n")
    .find((line) => line.startsWith("data:"));
  if (!dataLine) return null;
  try {
    return JSON.parse(dataLine.slice(5).trim()) as StreamEvent;
  } catch {
    return null;
  }
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [provider, setProvider] = useState<"groq" | "ollama">("groq");
  const abortRef = useRef<AbortController | null>(null);

  const handleSetProvider = useCallback((newProvider: "groq" | "ollama") => {
    setProvider(newProvider);
    setModel(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (rawInput: string, runtimeContext: RuntimeContext) => {
      const text = rawInput.trim();
      if (!text || isStreaming) return;

      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatMessage = { id: makeId(), role: "user", content: text };
      const assistantId = makeId();

      setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "" }]);

      setIsStreaming(true);

      const history = [...messages, userMessage]
        .filter((m) => m.content.trim().length > 0)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const patchAssistant = (patch: Partial<ChatMessage>) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
        );
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ message: text, history, context: runtimeContext, provider }),
        });

        if (!res.body) throw new Error("Empty response from the assistant.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamed = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) >= 0) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            const event = parseSseBlock(block);
            if (!event) continue;

            if (event.type === "meta") {
              if (event.model) {
                setModel(event.model);
                patchAssistant({ model: event.model });
              }
              continue;
            }

            if (event.type === "delta") {
              streamed += event.text;
              patchAssistant({ content: streamed });
              continue;
            }

            if (event.type === "done") {
              patchAssistant({
                content: event.answer || streamed,
                refused: event.refused !== undefined,
              });
              continue;
            }

            if (event.type === "error") {
              throw new Error(event.error);
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && m.content.trim().length === 0
              ? {
                  ...m,
                  content: "I could not produce an answer. Try rephrasing with a specific metric.",
                }
              : m,
          ),
        );
      } catch (error) {
        const aborted = (error as Error)?.name === "AbortError";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: aborted
                    ? m.content || "Stopped."
                    : (error as Error).message || "The local model is unavailable.",
                  error: !aborted,
                }
              : m,
          ),
        );
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [isStreaming, messages],
  );

  return { messages, isStreaming, model, provider, setProvider: handleSetProvider, send, stop, reset };
}
