// src/features/chat/components/ConversationListHeader.jsx
import { X } from "lucide-react";

export default function ConversationListHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-orange-600 rounded-t-xl">
      <p className="text-sm font-semibold text-white">Messages</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
