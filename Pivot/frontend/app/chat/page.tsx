"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "mentor";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Why is this a sliding window problem?",
  "Explain the brute force approach",
  "What edge cases am I missing?",
  "Give me another hint",
  "Explain this like I am a beginner",
];

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "mentor",
      text: "👋 Hey! I'm your PatternPilot mentor. Paste a problem, share your code, and ask me anything — I'll guide you without giving away the answer. Let's build real understanding! 🚀",
      timestamp: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", text: msg, timestamp: now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const data = await api.mentorChat({
        problem: problem || undefined,
        code: code || undefined,
        message: msg,
        context: {},
      });
      setMessages((m) => [
        ...m,
        { role: "mentor", text: data.reply, timestamp: now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "mentor",
          text: "Sorry, I couldn't connect to the backend. Make sure FastAPI is running on port 8000.",
          timestamp: now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () =>
    setMessages([
      {
        role: "mentor",
        text: "Chat cleared! What would you like to work on? 💪",
        timestamp: now(),
      },
    ]);

  return (
    <div className="flex flex-col h-screen max-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
        >
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
            AI Mentor Chat
          </p>
          <p className="text-xs" style={{ color: "var(--green)" }}>
            <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: "var(--green)" }} />
            Online
          </p>
        </div>
        <button
          onClick={clear}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: "var(--muted-fg)", border: "1px solid var(--card-border)" }}
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Context panel */}
        <div
          className="w-64 flex-shrink-0 flex flex-col p-4 gap-3 overflow-y-auto"
          style={{ borderRight: "1px solid var(--card-border)", background: "var(--sidebar-bg)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>
            Context (optional)
          </p>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--muted-fg)" }}>Problem</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={4}
              placeholder="Paste your problem here…"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--muted-fg)" }}>Your Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
              placeholder="Paste your code here…"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none font-mono"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--muted-fg)" }}>Quick prompts:</p>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "var(--accent-light)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-fade-in ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      m.role === "mentor"
                        ? "linear-gradient(135deg,#7c3aed,#3b82f6)"
                        : "rgba(124,58,237,0.15)",
                  }}
                >
                  {m.role === "mentor" ? (
                    <Bot size={15} className="text-white" />
                  ) : (
                    <User size={15} style={{ color: "var(--accent-light)" }} />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                  }`}
                  style={{
                    background:
                      m.role === "user"
                        ? "rgba(124,58,237,0.2)"
                        : "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--foreground)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                  <p
                    className="text-right text-xs mt-1"
                    style={{ color: "var(--muted)" }}
                  >
                    {m.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
                >
                  <Bot size={15} className="text-white" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                >
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent-light)" }} />
                  <span className="text-sm" style={{ color: "var(--muted-fg)" }}>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-6 py-4 flex gap-3"
            style={{ borderTop: "1px solid var(--card-border)", background: "var(--card-bg)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask your mentor anything about this problem…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--background)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                <Send size={16} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
