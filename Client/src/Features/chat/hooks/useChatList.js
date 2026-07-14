// src/features/chat/hooks/useChatList.js
import { useQuery } from "@tanstack/react-query";
import { getUserChats } from "../services/chatApi";
import { mockChatList } from "../data/mockChat";

const LIST_POLL_INTERVAL = 12000; // lighter than the 5s active-chat poll
const USE_MOCK = import.meta.env.VITE_USE_MOCK_CHAT === "true";

/**
 * useChatList — fetches every conversation belonging to the current
 * user (here: the guide), polling periodically for new previews /
 * unread counts. Kept separate from useChat (single-chat polling)
 * so opening one conversation doesn't affect this list's poll rate.
 */
export default function useChatList({ userId, enabled = true }) {
  const {
    data: chats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["chatList", userId],
    queryFn: async () => {
      if (USE_MOCK) return mockChatList;
      return getUserChats(userId);
    },
    enabled: !!userId && enabled,
    refetchInterval: enabled ? LIST_POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
  });

  // Sort by most recent activity so active conversations float to top
  const sorted = [...(chats || [])].sort((a, b) => {
    const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
    const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });

  return { chats: sorted, isLoading, isError };
}