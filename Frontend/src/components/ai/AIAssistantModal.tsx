// inside AIAssistantModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { XIcon, SendIcon, SparklesIcon, CalendarIcon, PackageIcon, LineChartIcon, ClipboardListIcon, UserIcon } from "lucide-react";
import { fetchWithAuth } from "../../lib/api"; // ✅ uses your global auth/logout

type Card =
  | { type: "table"; title: string; columns: string[]; rows: { cols: string[] }[] }
  | { type: "list"; title: string; bullets: string[] }
  | { type: "stats"; title: string; stats: Record<string, any> };

type AssistantApiResponse = {
  replyText: string;
  intent: string;
  confidence: number;
  cards?: Card[];
  quickActions?: string[];
};

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  cards?: Card[];
}

const nextId = (() => {
  let n = 1;
  return () => ++n;
})();

export const AIAssistantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  context?: "appointments" | "inventory" | "revenue" | "cases" | "general";
}> = ({ isOpen, onClose, context = "general" }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      // stop any inflight request to avoid late messages after close
      abortRef.current?.abort();
      abortRef.current = null;
      setIsTyping(false);
      return;
    }
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: nextId(),
        type: "assistant",
        content: getContextualGreeting(context),
        timestamp: new Date(),
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, context]);

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: nextId(), type: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // cancel previous
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const data = await fetchWithAuth<AssistantApiResponse>("/api/assistant/message", {
        method: "POST",
        body: JSON.stringify({ context, message: text }),
        signal: ac.signal as any,
      });

      const assistantMsg: Message = {
        id: nextId(),
        type: "assistant",
        content: data.replyText || "Done.",
        timestamp: new Date(),
        cards: data.cards || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      // if token expired, fetchWithAuth will trigger logout; no spam here
      if (String(e?.message || "").includes("UNAUTHORIZED")) return;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          type: "assistant",
          content: "I couldn’t reach the assistant service. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl relative z-10 max-h-[85vh] flex flex-col">
          {/* header ... keep your existing header */}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: "50vh" }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start max-w-[90%] ${m.type === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.type === "user"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 ml-3"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-3"
                  }`}>
                    {m.type === "user" ? <UserIcon size={16} /> : <SparklesIcon size={16} />}
                  </div>

                  <div className="w-full">
                    <div className={`px-4 py-3 rounded-lg ${
                      m.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                    }`}>
                      <p className="text-sm whitespace-pre-line">{m.content}</p>
                    </div>

                    {/* Cards */}
                    {m.type === "assistant" && m.cards && m.cards.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.cards.map((c, idx) => (
                          <div key={idx} className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/40 p-3">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{c.title}</div>

                            {c.type === "stats" && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {Object.entries(c.stats || {}).map(([k, v]) => (
                                  <div key={k} className="rounded-lg bg-slate-50 dark:bg-slate-900/40 px-2 py-2">
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{k}</div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{String(v)}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {c.type === "list" && (
                              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
                                {(c.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                              </ul>
                            )}

                            {c.type === "table" && (
                              <div className="mt-2 overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-[11px] text-slate-500 dark:text-slate-400">
                                      {(c.columns || []).map((h, i) => <th key={i} className="py-1 pr-2">{h}</th>)}
                                    </tr>
                                  </thead>
                                  <tbody className="text-slate-800 dark:text-slate-100">
                                    {(c.rows || []).map((r, i) => (
                                      <tr key={i} className="border-t border-slate-200/60 dark:border-slate-800/60">
                                        {r.cols.map((v, j) => <td key={j} className="py-2 pr-2">{v}</td>)}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-3">
                    <SparklesIcon size={16} />
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getContextualGreeting(ctx: string) {
  switch (ctx) {
    case "appointments":
      return "Hello! I can show today’s schedule, upcoming appointments, and gaps.";
    case "inventory":
      return "Hi! I can show low-stock alerts and inventory lists.";
    case "revenue":
      return "Hello! I can show revenue summaries for any range (e.g., last 7, 10, or 30 days).";
    case "cases":
      return "Hi! I can list open cases and cases needing attention.";
    default:
      return "Hello! Ask me about appointments, inventory, revenue, or cases.";
  }
}
