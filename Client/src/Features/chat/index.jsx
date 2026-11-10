// src/features/chat/index.js
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ChatButton from "./components/ChatButton";
import ChatWindow from "./components/ChatWindow";
import ConversationListHeader from "./components/ConversationListHeader";
import ConversationList from "./components/ConversationList";
import ChatPanel from "./components/ChatPanel";
import useChatList from "./hooks/useChatList";
import useChat from "./hooks/useChat";
import { useChatContext } from "./context/ChatContext";
import { useAuth } from '../../auth/AuthContext';

export { ChatProvider, useChatContext } from "./context/ChatContext";

function getGuideUserId(guide) {
  // Some screens seem to use `owner` for the guide's user id.
  return guide?.owner || guide?._id || null;
}

export default function ChatWidget({ initialChatId }) {
  const queryClient = useQueryClient();
  const { isOpen, selectedGuide, chatId, openChat, closeChat } =
    useChatContext();

  const { user } = useAuth();

  // Keep view local to the widget (Context is UI-only per requirement).
  const [view, setView] = useState(initialChatId ? "conversation" : "list");

  // Deep link support (existing feature)
  useEffect(() => {
    if (!initialChatId) return;
    openChat({ chatId: initialChatId });
    setView("conversation");
  }, [initialChatId, openChat]);

  // If a guide is selected externally OR a chatId is set, show conversation view.
  useEffect(() => {
    if (!isOpen) return;
    if (selectedGuide || chatId) setView("conversation");
  }, [isOpen, selectedGuide, chatId]);

  const userId = user?._id;
  const guideId = getGuideUserId(selectedGuide);

  // List is only fetched/polled while the widget is open.
  const { chats, isLoading: isListLoading } = useChatList({
    userId,
    enabled: isOpen,
  });

  const activeChatFromList = useMemo(
    () => chats.find((c) => c._id === chatId),
    [chats, chatId],
  );

  const {
    chat: chatFromQuery,
    messages,
    isLoading: isChatLoading,
    isError,
    isSending,
    sendMessage,
  } = useChat({
    chatId,
    userId,
    guideId,
    enabled: isOpen && view === "conversation" && (!!chatId || !!guideId),
    onChatCreated: (newChatId) => {
      // Save chatId in UI Context; next render will load messages via GET /chats/:chatId
      openChat({ chatId: newChatId });

      // Refresh conversation list so the newly created chat shows up immediately
      if (userId)
        queryClient.invalidateQueries({ queryKey: ["chatList", userId] });
    },
  });

  // Prefer list chat (has lastMessage/unread), fallback to loaded chat
  const chatForPanel =
    activeChatFromList ||
    chatFromQuery ||
    (guideId && userId
      ? { touristId: userId, tourGuideId: guideId } // minimal shape for header while creating
      : null);

  const openConversation = (nextChatId) => {
    openChat({ chatId: nextChatId, guide: null });
    setView("conversation");
  };

  const backToList = () => {
    // Clear selection like the old local activeChatId behavior
    openChat({ chatId: null, guide: null });
    setView("list");
  };

  const handleToggle = () => {
    if (isOpen) {
      closeChat();
      return;
    }
    openChat();
    if (!chatId && !selectedGuide) setView("list");
  };

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // If not logged in, keep widget hidden (prevents crashes)
  if (!userId) return null;

  return (
    <>
      {isOpen && (
        <ChatWindow>
          {view === "list" ? (
            <>
              <ConversationListHeader onClose={closeChat} />
              <ConversationList
                chats={chats}
                activeChatId={chatId}
                onSelect={openConversation}
                isLoading={isListLoading}
                currentUserId={userId}
              />
            </>
          ) : (
            <ChatPanel
              messages={messages}
              currentUserId={userId}
              chat={chatForPanel}
              isLoading={isChatLoading}
              isSending={isSending}
              error={isError}
              onSend={sendMessage}
              onClose={closeChat}
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
