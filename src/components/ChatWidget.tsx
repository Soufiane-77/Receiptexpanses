"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the ReceiptExpenses assistant. Ask me about templates, pricing, downloads or your account.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "Sorry, something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the server. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open ? (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-300" />
              <span className="text-sm font-semibold">ReceiptExpenses assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-brand-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
                  Typing…
                </div>
              </div>
            ) : null}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-700"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
