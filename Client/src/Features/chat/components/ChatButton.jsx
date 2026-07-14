// src/features/chat/components/ChatButton.jsx
import { MessageCircle, X } from "lucide-react";

/**
 * Floating action button fixed to the bottom-right corner.
 * Toggles the chat window open/closed.
 */
export default function ChatButton({ isOpen, onClick, unreadCount = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      className="
        fixed bottom-5 right-5 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-orange-600 hover:bg-orange-700
        text-white shadow-lg hover:shadow-xl
        transition-all duration-200
        active:scale-95
        sm:bottom-6 sm:right-6
      "
    >
      {isOpen ? (
        <X className="w-6 h-6" strokeWidth={2.25} />
      ) : (
        <MessageCircle className="w-6 h-6" strokeWidth={2.25} />
      )}

      {!isOpen && unreadCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            flex items-center justify-center
            min-w-[20px] h-5 px-1
            rounded-full bg-red-500
            text-[11px] font-semibold text-white
            ring-2 ring-white
          "
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
