// src/features/chat/context/ChatContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ChatContext = createContext(null);

/**
 * UI-state only:
 * - isOpen
 * - selectedGuide
 * - chatId
 * - openChat()
 * - closeChat()
 *
 * Server state stays in React Query hooks (useChat/useChatList).
 */
export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [chatId, setChatId] = useState(null);

  /**
   * Flexible signature to support:
   * - openChat()                      -> just open widget
   * - openChat({ guide })             -> open + start conversation with guide
   * - openChat({ chatId })            -> open + open existing conversation
   * - openChat({ chatId: null })      -> clear active conversation (back to list)
   */
  const openChat = useCallback(({ guide, chatId: nextChatId } = {}) => {
    setIsOpen(true);

    if (guide !== undefined) setSelectedGuide(guide);
    if (nextChatId !== undefined) setChatId(nextChatId);
  }, []);

  // Keep behavior minimal: closing does not wipe selection (same as old widget state)
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      selectedGuide,
      chatId,
      openChat,
      closeChat,
    }),
    [isOpen, selectedGuide, chatId, openChat, closeChat],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx)
    throw new Error("useChatContext must be used within a ChatProvider");
  return ctx;
}
