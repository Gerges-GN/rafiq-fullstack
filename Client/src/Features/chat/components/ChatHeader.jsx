// src/features/chat/components/ChatHeader.jsx
import { X, ArrowLeft } from "lucide-react";

/**
 * Header of the chat window: guide avatar, name, online indicator,
 * and window controls. Shows a back arrow instead of the avatar info
 * when `onBack` is provided (i.e. we're inside a conversation opened
 * from the list, and can return to it).
 */
export default function ChatHeader({ participant, onClose, onBack }) {
  const { name, avatarUrl } = participant || {};

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-orange-600 rounded-t-xl">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="p-1 -ml-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="relative shrink-0">
          <img
            src={avatarUrl || "https://i.pravatar.cc/100?img=12"}
            alt={name || "Chat"}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {name || "Chat"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
