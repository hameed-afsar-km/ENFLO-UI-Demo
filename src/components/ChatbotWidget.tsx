"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageSquare, X, Send, Bot, Square, Trash2, ShieldAlert } from "lucide-react";
import { useAssistantChat, type ChatMessage } from "@/hooks/useAssistantChat";
import { useSimulation } from "@/context/SimulationContext";
import { SUGGESTIONS } from "@/lib/assistant/knowledge";
import { cn } from "@/lib/utils";

function Bubble({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm bg-accent text-white text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[88%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm whitespace-pre-wrap break-words border shadow-sm",
          message.error
            ? "bg-red-50 border-red-100 text-red-700"
            : message.refused
              ? "bg-amber-50 border-amber-100 text-amber-900"
              : "bg-white border-border text-primary-text",
        )}
      >
        {message.refused && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 text-amber-600">
            <ShieldAlert size={12} /> Out of scope
          </div>
        )}
        {message.content || (streaming ? <TypingDots /> : null)}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary-text/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-secondary-text/60 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-secondary-text/60 animate-bounce" style={{ animationDelay: "240ms" }} />
    </span>
  );
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messages, isStreaming, model, send, stop, reset } = useAssistantChat();
  const { activeSimulations, notifications } = useSimulation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPlant = searchParams?.get("plantName") ?? null;

  const runtimeContext = useMemo(
    () => ({
      route: pathname,
      selectedPlant,
      activeSimulations: activeSimulations.map((s) => ({
        type: s.type,
        plantName: s.plantName,
        panelId: s.panelId,
        location: s.location,
        time: s.time,
        message: s.message,
      })),
      notifications: notifications.slice(0, 8).map((n) => ({
        title: n.title,
        message: n.message,
        type: n.type,
        time: n.time,
        read: Boolean(n.read),
      })),
    }),
    [pathname, selectedPlant, activeSimulations, notifications],
  );

  useEffect(() => {
    if (isOpen) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value || isStreaming) return;
    setInputValue("");
    void send(value, runtimeContext);
  };

  const handleSuggestion = (value: string) => {
    if (isStreaming) return;
    void send(value, runtimeContext);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open ENECO Assistant"
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-accent-dark text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 z-50 cursor-pointer",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100",
        )}
      >
        <MessageSquare size={24} />
        {activeSimulations.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full border-2 border-white">
            {activeSimulations.length}
          </span>
        )}
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 w-[22rem] h-[30rem] max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="bg-accent-dark text-white px-4 py-3 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Bot size={20} className="shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-sm leading-tight truncate">ENECO Assistant</div>
              <div className="text-[10px] font-medium opacity-80 truncate">
                {model ? `Local model: ${model}` : "Local model: connecting"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isEmpty && (
              <button
                onClick={reset}
                disabled={isStreaming}
                aria-label="Clear conversation"
                className="hover:bg-white/20 p-1.5 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="hover:bg-white/20 p-1.5 rounded-md transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 px-3 py-3 overflow-y-auto flex flex-col gap-2.5 bg-gray-50/50">
          {isEmpty ? (
            <div className="flex flex-col gap-3 py-2">
              <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white border border-border text-sm shadow-sm text-primary-text">
                Hello! I am the ENECO Assistant. I answer only from live plant data — generation, PR and soiling, battery health, grid tariffs and savings, forecasts, events and reports.
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-800">
                Out of subject questions — code, general maths, trivia — I decline on purpose.
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-left px-3 py-2 rounded-xl bg-white border border-border text-xs font-medium text-secondary-text hover:border-accent hover:text-accent-dark transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <Bubble
                key={msg.id}
                message={msg}
                streaming={isStreaming && msg.role === "assistant" && msg.content.length === 0}
              />
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about generation, PR, battery, savings..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={600}
            className="flex-1 border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-white"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              className="w-10 h-10 rounded-full bg-primary-text text-white flex items-center justify-center hover:bg-black transition-colors shrink-0 cursor-pointer"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          )}
        </form>
      </div>
    </>
  );
}
