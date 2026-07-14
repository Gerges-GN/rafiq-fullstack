// src/features/chat/components/MessageList.jsx
import { useEffect, useRef } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";

/**
 * Scrollable list of messages. Handles:
 * - loading state
 * - empty state
 * - auto-scroll to latest message
 */
export default function MessageList({ messages, currentUserId, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">Loading conversation…</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 px-6 text-center">
        <MessageCircle className="w-10 h-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">No messages yet</p>
        <p className="text-xs text-gray-400">
          Say hello to your guide to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-white">
      {messages.map((message) => (
        <MessageBubble
          key={message._id || message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
