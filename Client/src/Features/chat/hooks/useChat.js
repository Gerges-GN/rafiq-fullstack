// src/features/chat/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChat, createChat, sendMessage } from "../services/chatApi";
import { mockChat } from "../data/mockChat";

const POLL_INTERVAL = 5000;
// Toggle via env var instead of a hardcoded flag, so it can't accidentally
// ship to production still pointed at mock data.
const USE_MOCK = import.meta.env.VITE_USE_MOCK_CHAT === "true";

/**
 * Maps backend message format to UI format
 */
function mapMessage(msg) {
  return {
    _id: msg._id,
    senderId: msg.writerId,
    text: msg.content,
    createdAt: msg.createdAt,
  };
}

/**
 * Maps backend chat format to UI format
 */
function mapChat(chat) {
  return {
    _id: chat._id,
    touristId: chat.touristId,
    tourGuideId: chat.tourGuideId,
    messages: (chat.messages || []).map(mapMessage),
  };
}

/**
 * useChat — encapsulates all chat data logic:
 * - loads (or creates) a chat
 * - polls every 5s for new messages
 * - exposes a sendMessage mutation with optimistic update
 *
 * `onChatCreated(newChatId)` is called once a brand-new conversation is
 * created (i.e. no `chatId` was passed in, only `guideId`), so the parent
 * component can update its `activeChatId` state and reopen this same chat
 * later from the conversation list.
 */
export default function useChat({ chatId, userId, guideId, enabled, onChatCreated }) {
  const queryClient = useQueryClient();
  // Use a stable key even before the chat has an id yet, so a "new chat with
  // guide X" query doesn't collide with "new chat with guide Y".
  const queryKey = ["chat", chatId || `new:${guideId}`];

  const {
    data: chat,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (USE_MOCK) return mapChat(mockChat);

      if (chatId) {
        const response = await getChat(chatId);
        return mapChat(response);
      }

      // Create new chat
      const response = await createChat({
        touristId: userId,
        tourGuideId: guideId,
      });
      const mapped = mapChat(response);
      onChatCreated?.(mapped._id);
      return mapped;
    },
    enabled: !!enabled,
    refetchInterval: enabled ? POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  const { mutate: send, isPending: isSending } = useMutation({
    mutationFn: async (text) => {
      if (USE_MOCK) {
        // Simulate server round-trip for the mock path.
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                _id: `msg_${Date.now()}`,
                senderId: userId,
                text,
                createdAt: new Date().toISOString(),
              }),
            300
          )
        );
      }

      if (!chat?._id) {
        throw new Error("Chat isn't loaded yet — can't send a message.");
      }

      const response = await sendMessage(chat._id, {
        writerId: userId,
        content: text,
      });
      return mapMessage(response);
    },
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey });
      const previousChat = queryClient.getQueryData(queryKey);

      const optimisticMessage = {
        _id: `temp_${Date.now()}`,
        senderId: userId,
        text,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        messages: [...(old?.messages || []), optimisticMessage],
      }));

      return { previousChat, optimisticId: optimisticMessage._id };
    },
    onError: (_err, _text, context) => {
      if (context?.previousChat) {
        queryClient.setQueryData(queryKey, context.previousChat);
      }
    },
    onSuccess: (newMessage, _text, context) => {
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        messages: (old?.messages || []).map((m) =>
          m._id === context.optimisticId ? newMessage : m
        ),
      }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    chat,
    messages: chat?.messages || [],
    isLoading,
    isError,
    error,
    isSending,
    sendMessage: send,
  };
}