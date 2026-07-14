```js
// src/features/chat/components/ChatButton.jsx
import { MessageCircle, X } from "lucide-react";

/**
 * Floating action button fixed to the bottom-right corner.
 * Toggles the chat window open/closed.
 */
export default function ChatButton({ isOpen, onClick, unreadCount = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      className="
        fixed bottom-5 right-5 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-orange-600 hover:bg-orange-700
        text-white shadow-lg hover:shadow-xl
        transition-all duration-200
        active:scale-95
        sm:bottom-6 sm:right-6
      "
    >
      {isOpen ? (
        <X className="w-6 h-6" strokeWidth={2.25} />
      ) : (
        <MessageCircle className="w-6 h-6" strokeWidth={2.25} />
      )}

      {!isOpen && unreadCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            flex items-center justify-center
            min-w-[20px] h-5 px-1
            rounded-full bg-red-500
            text-[11px] font-semibold text-white
            ring-2 ring-white
          "
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

```

```js
// src/features/chat/components/ChatHeader.jsx
import { X, ArrowLeft } from "lucide-react";

/**
 * Header of the chat window: guide avatar, name, online indicator,
 * and window controls. Shows a back arrow instead of the avatar info
 * when `onBack` is provided (i.e. we're inside a conversation opened
 * from the list, and can return to it).
 */
export default function ChatHeader({ participant, onClose, onBack }) {
  const { name, avatarUrl, isOnline } = participant || {};

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
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-orange-600 ${
              isOnline ? "bg-green-400" : "bg-gray-400"
            }`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {name || "Chat"}
          </p>
          <p className="text-xs text-orange-100">
            {isOnline ? "Online" : "Offline"}
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

```

```js
// src/features/chat/components/ChatInput.jsx
import { useState } from "react";
import { Send } from "lucide-react";

/**
 * Message composer with auto-resizing textarea and send button.
 */
export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 bg-white px-3 py-2.5 rounded-b-xl">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message…"
        rows={1}
        disabled={disabled}
        className="
          flex-1 resize-none max-h-24 text-sm
          rounded-full border border-gray-300 px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-400
        "
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        aria-label="Send message"
        className="
          shrink-0 flex items-center justify-center
          w-9 h-9 rounded-full
          bg-orange-600 text-white
          hover:bg-orange-700 transition-colors
          disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
        "
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

```

```js
// src/features/chat/components/ChatPanel.jsx
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { MessageCircle } from "lucide-react";

export default function ChatPanel({
  participant,
  messages,
  currentUserId,
  isLoading,
  isSending,
  error,
  onSend,
  onClose,
  onBack,
  emptySelection,
}) {
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

```

```js
// src/features/chat/components/ChatWindow.jsx

/**
 * Floating container only — positioning + chrome. Content (list or
 * conversation) is passed in as children so ChatWidget controls what
 * renders inside based on view state.
 */
export default function ChatWindow({ children }) {
  return (
    <div
      className="
        fixed bottom-24 right-5 z-50
        w-[92vw] max-w-sm h-[70vh] max-h-[560px]
        flex flex-col
        bg-white rounded-xl shadow-2xl border border-gray-200
        overflow-hidden
        sm:bottom-24 sm:right-6
      "
    >
      {children}
    </div>
  );
}

```

```js
// src/features/chat/components/ConversationItem.jsx

function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ConversationItem({ chat, isActive, onClick }) {
  // ✅ Handle both tourist and guide perspectives
  const { tourist, guide, lastMessage, unreadCount } = chat;

  // Show the other participant (guide if viewing as tourist, tourist if viewing as guide)
  const participant = tourist || guide;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
        ${isActive ? "bg-orange-50" : "hover:bg-gray-50"}
      `}
    >
      <img
        src={participant.avatarUrl}
        alt={participant.name}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate ${unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
          >
            {participant.name}
          </p>
          <span className="text-[11px] text-gray-400 shrink-0">
            {formatRelativeTime(lastMessage?.createdAt)}
          </span>
        </div>
        <p
          className={`text-xs truncate ${unreadCount > 0 ? "text-gray-700" : "text-gray-400"}`}
        >
          {lastMessage?.text}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-orange-600 text-white text-[10px] font-semibold px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

```

```js
// src/features/chat/components/ConversationList.jsx
import { Loader2, Inbox } from "lucide-react";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  chats,
  activeChatId,
  onSelect,
  isLoading,
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
        />
      ))}
    </div>
  );
}

```

```js
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

```

```js
// src/features/chat/components/MessageBubble.jsx

/**
 * Single chat message bubble. Styled differently depending on
 * whether the current user sent it or received it.
 */
export default function MessageBubble({ message, isOwn }) {
  const { text, createdAt } = message;

  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-1`}>
      <div
        className={`
          max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
          ${
            isOwn
              ? "bg-orange-600 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-800 rounded-bl-sm"
          }
        `}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        <span
          className={`block mt-1 text-[10px] ${
            isOwn ? "text-orange-100" : "text-gray-400"
          } text-right`}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

```

```js
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

```

```js
// src/features/chat/data/mockChat.js

export const mockGuide = {
  _id: "guide_1",
  name: "Ahmed Hassan",
  avatarUrl: "https://i.pravatar.cc/100?img=12",
  isOnline: true,
};

export const mockTourist = {
  _id: "user_1",
  name: "Sarah Johnson",
  avatarUrl: "https://i.pravatar.cc/100?img=5",
  isOnline: false,
};

export const mockChat = {
  _id: "chat_1",
  touristId: "user_1",
  tourGuideId: "guide_1",
  messages: [
    {
      _id: "msg_1",
      senderId: "guide_1",
      text: "Hello! Welcome to Rafiq 👋 How can I help you plan your trip to Egypt?",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      _id: "msg_2",
      senderId: "user_1",
      text: "Hi! I'm interested in a 3-day tour of Luxor and Aswan.",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      _id: "msg_3",
      senderId: "guide_1",
      text: "Great choice! I can put together an itinerary covering the Valley of the Kings, Karnak Temple, and a Nile cruise.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
};

export const mockChatList = [
  {
    _id: "chat_1",
    tourist: mockTourist,
    guide: mockGuide,
    lastMessage: {
      text: "That sounds perfect, thank you!",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      senderId: "user_1",
    },
    unreadCount: 2,
  },
  {
    _id: "chat_2",
    tourist: {
      _id: "user_2",
      name: "Michael Chen",
      avatarUrl: "https://i.pravatar.cc/100?img=8",
    },
    guide: mockGuide,
    lastMessage: {
      text: "Is the tour available next Friday?",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      senderId: "user_2",
    },
    unreadCount: 0,
  },
];
```

```js
// src/features/chat/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChat, createChat, sendMessage } from "../services/chatApi";
import { mockChat } from "../data/mockChat";

const POLL_INTERVAL = 5000;
const USE_MOCK = false; // Set to true to use mock data

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
 */
export default function useChat({ chatId, userId, guideId, enabled }) {
  const queryClient = useQueryClient();
  const queryKey = ["chat", chatId];

  const {
    data: chat,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (USE_MOCK) return mockChat;

      if (chatId) {
        const response = await getChat(chatId);
        return mapChat(response);
      }

      // Create new chat
      const response = await createChat({
        touristId: userId,
        tourGuideId: guideId,
      });
      return mapChat(response);
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
```

```js
// src/features/chat/hooks/useChatList.js
import { useQuery } from "@tanstack/react-query";
import { getUserChats } from "../services/chatApi";
import { mockChatList } from "../data/mockChat";

const LIST_POLL_INTERVAL = 12000; // lighter than the 5s active-chat poll
const USE_MOCK = true;

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
    const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt).getTime();
    const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt).getTime();
    return bTime - aTime;
  });

  return { chats: sorted, isLoading, isError };
}
```

```js
// src/features/chat/pages/GuideInbox.jsx
import { useState } from "react";
import ConversationList from "../components/ConversationList";
import ChatPanel from "../components/ChatPanel";
import useChatList from "../hooks/useChatList";
import useChat from "../hooks/useChat";

/**
 * Full-page/dashboard-embedded inbox for a tour guide handling
 * multiple tourists. Two-pane layout: conversation list + active chat.
 */
export default function GuideInbox({ guideId }) {
  const [activeChatId, setActiveChatId] = useState(null);

  const { chats, isLoading: isListLoading } = useChatList({ userId: guideId });

  const activeChat = chats.find((c) => c._id === activeChatId);

  const {
    messages,
    isLoading: isChatLoading,
    isError,
    isSending,
    sendMessage,
  } = useChat({
    chatId: activeChatId,
    userId: guideId,
    enabled: !!activeChatId, // only poll once a conversation is opened
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-full max-w-xs border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Messages</h2>
        </div>
        <ConversationList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          isLoading={isListLoading}
        />
      </aside>

      {/* Active chat */}
      <section className="flex-1 flex flex-col">
        <ChatPanel
          participant={activeChat?.tourist} // ✅ Fixed: use 'participant' instead of 'tourist'
          messages={messages}
          currentUserId={guideId}
          isLoading={isChatLoading}
          isSending={isSending}
          error={isError}
          onSend={sendMessage}
          onClose={() => setActiveChatId(null)}
          emptySelection={!activeChatId}
        />
      </section>
    </div>
  );
}

```

```js
// src/features/chat/services/chatApi.js

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Thin fetch wrapper — throws on non-2xx responses so React Query's
 * error state is triggered correctly.
 */
async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

/** POST /chats — create a new chat between tourist and guide */
export function createChat({ touristId, tourGuideId }) {
  return request("/chats", {
    method: "POST",
    body: JSON.stringify({ touristId, tourGuideId }),
  });
}

/** GET /chats/:id — fetch a single chat with its messages */
export function getChat(chatId) {
  return request(`/chats/${chatId}`, { method: "GET" });
}

/** GET /chats/user/:userId — fetch all chats belonging to a user */
export function getUserChats(userId) {
  return request(`/chats/user/${userId}`, { method: "GET" });
}

/** POST /chats/:id/messages — send a message in a chat */
export function sendMessage(chatId, { writerId, content }) {
  return request(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ writerId, content }),
  });
}

/** PUT /chats/:id/messages/:messageId — edit a message */
export function editMessage(chatId, messageId, { content }) {
  return request(`/chats/${chatId}/messages/${messageId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

/** DELETE /chats/:id/messages/:messageId — delete a message */
export function deleteMessage(chatId, messageId) {
  return request(`/chats/${chatId}/messages/${messageId}`, {
    method: "DELETE",
  });
}
```
```js
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
export default function ChatWidget({ userId, initialChatId }) {
  const [isOpen, setIsOpen] = useState(!!initialChatId);
  const [view, setView] = useState(initialChatId ? "conversation" : "list");
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);

  // List is only fetched/polled while the widget is open.
  const { chats, isLoading: isListLoading } = useChatList({
    userId,
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
    userId,
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
              />
            </>
          ) : (
            <ChatPanel
              participant={activeChat?.guide || activeChat?.tourist}
              messages={messages}
              currentUserId={userId}
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

```