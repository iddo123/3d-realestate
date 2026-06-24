"use client";

import { useEffect, useRef, useState } from "react";
import { answerQuestion } from "../lib/answerQuestion";

const QUICK_QUESTIONS = [
  "האם המחיר גמיש?",
  "אילו מאפיינים יש בנכס?",
  "ספר לי על השכונה",
  "מה שטח הדירה ומספר החדרים?",
];

export default function QuestionsButton({ property }) {
  // view: null (closed) | "menu" | "chat"
  const [view, setView] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', content}
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!view) return;
    const onKey = (e) => e.key === "Escape" && setView(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [view]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");
    const history = messages;
    setMessages([...history, { role: "user", content: question }]);
    setLoading(true);
    try {
      // Server answers via the LLM when ANTHROPIC_API_KEY is set, otherwise it
      // returns the rule-based answer. Either way we get an { answer }.
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property?.id, question, history }),
      });
      const data = await res.json();
      const answer = data.answer || answerQuestion(property, question);
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch {
      // Request itself failed (offline etc.) → local rule-based fallback.
      setMessages((m) => [
        ...m,
        { role: "assistant", content: answerQuestion(property, question) },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating call-to-action button */}
      <button
        type="button"
        onClick={() => setView("menu")}
        aria-label="שאלו את הסוכן הדיגיטלי"
        className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-bold text-white shadow-search transition-transform hover:scale-105 hover:bg-teal-600"
      >
        <span aria-hidden className="text-lg leading-none">
          💬
        </span>
        שאלו את הסוכן הדיגיטלי
      </button>

      {view && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setView(null)}
            aria-hidden
          />

          {/* ---- Menu ---- */}
          {view === "menu" && (
            <div
              dir="rtl"
              role="dialog"
              aria-modal="true"
              aria-label="במה אפשר לעזור"
              className="relative w-full max-w-md rounded-xl2 bg-white p-6 shadow-search"
            >
              <button
                type="button"
                onClick={() => setView(null)}
                aria-label="סגירה"
                className="absolute left-4 top-4 text-xl text-ink-faint hover:text-ink"
              >
                ✕
              </button>
              <h3 className="text-lg font-extrabold text-ink">במה אפשר לעזור?</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {property?.address ? `לגבי ${property.address}` : "בחרו אפשרות"}
              </p>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="flex w-full items-center gap-3 rounded-xl2 border border-black/5 bg-white p-4 text-right shadow-sm transition-colors hover:border-teal hover:bg-teal-50"
                >
                  <span className="text-2xl">💬</span>
                  <span>
                    <span className="block font-bold text-ink">שאלות ותשובות</span>
                    <span className="block text-sm text-ink-soft">
                      צ'אט חופשי – שאלו כל דבר על הנכס
                    </span>
                  </span>
                </button>

                <div
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl2 border border-black/5 bg-cream p-4 text-right opacity-70"
                  aria-disabled="true"
                >
                  <span className="text-2xl">🎙️</span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-ink">סיור וירטואלי קולי</span>
                      <span className="rounded-full bg-ink-faint/20 px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                        בקרוב
                      </span>
                    </span>
                    <span className="block text-sm text-ink-soft">
                      שאלו בקול וקבלו תשובה קולית
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ---- Chat ---- */}
          {view === "chat" && (
            <div
              dir="rtl"
              role="dialog"
              aria-modal="true"
              aria-label="שאלות ותשובות"
              className="relative flex h-[70vh] max-h-[560px] w-full max-w-md flex-col overflow-hidden rounded-xl2 bg-white shadow-search"
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  aria-label="חזרה"
                  className="text-sm font-semibold text-ink-soft hover:text-teal"
                >
                  → חזרה
                </button>
                <div className="text-sm font-bold text-ink">שאלות ותשובות</div>
                <button
                  type="button"
                  onClick={() => setView(null)}
                  aria-label="סגירה"
                  className="text-xl text-ink-faint hover:text-ink"
                >
                  ✕
                </button>
              </div>

              {/* messages */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-cream p-4">
                <div className="max-w-[85%] rounded-xl2 rounded-tr-sm bg-white px-3 py-2 text-sm text-ink shadow-sm">
                  שלום! אני העוזר הווירטואלי של רגבים. שאלו אותי כל דבר על{" "}
                  {property?.address || "הנכס"}.
                </div>

                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-soft shadow-sm transition-colors hover:bg-teal-50 hover:text-teal-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[85%] rounded-xl2 rounded-tl-sm bg-teal px-3 py-2 text-sm text-white"
                        : "max-w-[85%] whitespace-pre-wrap rounded-xl2 rounded-tr-sm bg-white px-3 py-2 text-sm text-ink shadow-sm"
                    }
                  >
                    {m.content}
                  </div>
                ))}

                {loading && (
                  <div className="max-w-[85%] rounded-xl2 rounded-tr-sm bg-white px-3 py-2 text-sm text-ink-faint shadow-sm">
                    כותב…
                  </div>
                )}
              </div>

              {/* input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t border-black/5 p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  // Keep keystrokes from reaching the 3D viewer's window-level
                  // keyboard shortcuts (which otherwise hijack letters/arrows on
                  // the tour page). Esc still closes the chat.
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape") setView(null);
                  }}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="כתבו שאלה…"
                  className="flex-1 rounded-full border border-black/10 px-4 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-teal focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="shrink-0 rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-50"
                >
                  שליחה
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
