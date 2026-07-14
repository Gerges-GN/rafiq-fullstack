// src/features/chat/index.js
import { useState } from "react";
import ChatButton from "./components/ChatButton";
import ChatWindow from "./components/ChatWindow";
import ConversationListHeader from "./components/ConversationListHeader";
import ConversationList from "./components/ConversationList";
import ChatPanel from "./components/ChatPanel";
import useChatList from "./hooks/useChatList";
import useChat from "./hooks/useChat";

/**
 * ChatWidget — floating chat with two internal views:
 * - "list": all of the tourist's conversations (WhatsApp-style)
 * - "conversation": a single open chat
 *
 * Usage:
 *   <ChatWidget userId={currentUser._id} />
 *
 * To deep-link straight into a conversation (e.g. from a guide's
 * profile "Message" button), pass `initialChatId` and the widget
 * opens directly in conversation view for that chat.
 */
export default function ChatWidget({ initialChatId }) {
  const [user] = useState(() =>
      JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null")
  );
  const [isOpen, setIsOpen] = useState(!!initialChatId);
  const [view, setView] = useState(initialChatId ? "conversation" : "list");
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);

  // List is only fetched/polled while the widget is open.
  const { chats, isLoading: isListLoading } = useChatList({
    userId: user._id,
    enabled: isOpen,
  });

  const activeChat = chats.find((c) => c._id === activeChatId);
  // Active conversation only polls when it's actually the open view.
  const {
    messages,
    isLoading: isChatLoading,
    isError,
    isSending,
    sendMessage,
  } = useChat({
    chatId: activeChatId,
    userId: user._id,
    enabled: isOpen && view === "conversation" && !!activeChatId,
  });

  const openConversation = (chatId) => {
    setActiveChatId(chatId);
    setView("conversation");
  };

  const backToList = () => {
    setView("list");
    setActiveChatId(null);
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    // Default to list view each time it's reopened, unless a specific
    // chat was deep-linked in via initialChatId on mount.
    if (!activeChatId) setView("list");
  };

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  return (
    <>
      {isOpen && (
        <ChatWindow>
          {view === "list" ? (
            <>
              <ConversationListHeader onClose={() => setIsOpen(false)} />
              <ConversationList
                chats={chats}
                activeChatId={activeChatId}
                onSelect={openConversation}
                isLoading={isListLoading}
                currentUserId={user._id}
                currentUserRole={user.role}
              />
            </>
          ) : (
            <ChatPanel
              messages={messages}
              currentUserId={user._id}
              currentUserRole={user.role}
              chat={activeChat}
              isLoading={isChatLoading}
              isSending={isSending}
              error={isError}
              onSend={sendMessage}
              onClose={() => setIsOpen(false)}
              // Only show back arrow if there's a list to go back to
              // (i.e. not a fresh deep-link with no other context).
              onBack={backToList}
            />
          )}
        </ChatWindow>
      )}
      <ChatButton
        isOpen={isOpen}
        onClick={handleToggle}
        unreadCount={totalUnread}
      />
    </>
  );
}
