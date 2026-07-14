// src/features/chat/components/ChatInput.jsx
import { useState } from "react";
import { Send } from "lucide-react";

/**
 * Message composer with auto-resizing textarea and send button.
 */
export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 bg-white px-3 py-2.5 rounded-b-xl">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message…"
        rows={1}
        disabled={disabled}
        className="
          flex-1 resize-none max-h-24 text-sm
          rounded-full border border-gray-300 px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-400
        "
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label="Send message"
        className="
          shrink-0 flex items-center justify-center
          w-9 h-9 rounded-full
          bg-orange-600 text-white
          hover:bg-orange-700 transition-colors
          disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
        "
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
