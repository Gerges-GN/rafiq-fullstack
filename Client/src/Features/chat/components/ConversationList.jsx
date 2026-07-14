// src/features/chat/components/ConversationList.jsx
import { Loader2, Inbox } from "lucide-react";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  chats,
  activeChatId,
  onSelect,
  isLoading,
  currentUserId,
  currentUserRole // 👈 جديد
}) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 px-4 text-center">
        <Inbox className="w-8 h-8 text-gray-300" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
      {chats.map((chat) => (
        <ConversationItem
          key={chat._id}
          chat={chat}
          isActive={chat._id === activeChatId}
          onClick={() => onSelect(chat._id)}
          currentUserId={currentUserId} 
          currentUserRole={currentUserRole}// 👈 مرّرها هنا
        />
      ))}
    </div>
  );
}
