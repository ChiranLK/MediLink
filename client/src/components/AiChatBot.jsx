import { useState, useRef, useEffect, useCallback } from "react";
import { FiMessageCircle, FiX, FiSend, FiAlertCircle } from "react-icons/fi";
import customFetch from "@/utils/customFetch";

// ── Customization ────────────────────────────────────────────────────────────
const BOT_NAME = "MediLink AI";
const WELCOME_TEXT =
  "Hi there! 👋 I'm your MediLink assistant. Ask me anything about our services, booking appointments, or general health tips!";
const STORAGE_KEY = "medilink_chat_history";
// ─────────────────────────────────────────────────────────────────────────────

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ role: "assistant", content: WELCOME_TEXT }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Send only role + content (strip any extra fields)
      const payload = updatedMessages.map(({ role, content }) => ({
        role,
        content,
      }));
      const { data } = await customFetch.post("/api/auth/chat", {
        messages: payload,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to get a response. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: WELCOME_TEXT }]);
    setError("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-primary hover:bg-primary/90 text-white"
        }`}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 dark:border-gray-700 dark:bg-slate-800 ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
        style={{ height: "min(520px, calc(100vh - 10rem))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{BOT_NAME}</p>
              <p className="text-[11px] opacity-80">
                {loading ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            title="Clear chat"
            className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-white/20 transition"
          >
            Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-100 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-slate-700">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FiAlertCircle className="shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              maxLength={2000}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:opacity-50 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiChatBot;
