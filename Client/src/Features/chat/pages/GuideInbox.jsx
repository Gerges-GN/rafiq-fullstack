// src/features/chat/pages/GuideInbox.jsx
import { useState } from "react";
import { useOutletContext } from 'react-router-dom';
import ConversationList from "../components/ConversationList";
import ChatPanel from "../components/ChatPanel";
import useChatList from "../hooks/useChatList";
import useChat from "../hooks/useChat";

/**
 * Full-page/dashboard-embedded inbox for a tour guide handling
 * multiple tourists. Two-pane layout: conversation list + active chat.
 */
export default function GuideInbox({ guideId: guideIdProp } = {}) {
  const verifiedUser = useOutletContext();
  const guideId = guideIdProp || verifiedUser?._id;
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
    <div className="flex flex-col md:flex-row min-h-[50vh] md:min-h-[70vh] max-h-[calc(100vh-200px)] border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Sidebar */}

      <aside
        className={` w-full md:max-w-xs md:border-r border-b border-gray-200 flex flex-col 
                          ${activeChatId != null && "hidden md:block"}`}
      >
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Messages</h2>
        </div>
        <ConversationList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          isLoading={isListLoading}
          currentUserId={guideId}
        />
      </aside>

      {/* Active chat */}
      <section className="flex-1 flex flex-col min-h-[50vh] md:min-h-[70vh] max-h-[calc(100vh-200px)]">
        <ChatPanel
          chat={activeChat ? [activeChat] : []}
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
