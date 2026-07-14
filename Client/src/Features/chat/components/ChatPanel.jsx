// src/features/chat/components/ChatPanel.jsx
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { MessageCircle } from "lucide-react";
import useParticipantProfile from "../hooks/useParticipantProfile";
export default function ChatPanel({
  messages,
  currentUserId,
  currentUserRole,
  chat,
  isLoading,
  isSending,
  error,
  onSend,
  onClose,
  onBack,
  emptySelection,
}) {
  const participant_id = chat.touristId === currentUserId ? chat.tourGuideId : chat.touristId;
  const participant = useParticipantProfile(participant_id, currentUserRole);
  if (emptySelection) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
        <MessageCircle className="w-10 h-10 text-gray-300" />
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <>
      <ChatHeader participant={participant} onClose={onClose} onBack={onBack} />
      {error ? (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-red-500">
            Something went wrong loading this chat.
          </p>
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
        />
      )}
      <ChatInput onSend={onSend} disabled={isLoading || isSending} />
    </>
  );
}
