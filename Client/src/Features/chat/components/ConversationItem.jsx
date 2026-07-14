// src/features/chat/components/ConversationItem.jsx
import { useState, useEffect, useRef } from "react";
import useParticipantProfile from "../hooks/useParticipantProfile";
function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}


export default function ConversationItem({
  chat,
  isActive,
  onClick,
  currentUserId,
  currentUserRole,
}) {
  // Real shape: { _id, touristId, tourGuideId, messages: [{ writerId, content, createdAt, edited, _id }], createdAt, updatedAt }
  const { touristId, tourGuideId, messages = [] } = chat;

  // The other side of the conversation, by id only — there's no populated
  // tourist/guide object on this document, just raw ObjectId strings.
  const participantId = touristId === currentUserId ? tourGuideId : touristId;

  // Derive "last message" from the messages array — the schema doesn't
  // store it separately. Messages appear oldest-first, so the last item
  // in the array is the most recent one. This updates automatically
  // whenever the parent re-renders with a fresh `chat` object (e.g. from
  // useChatList's polling), since it's derived directly from the prop
  // rather than copied into local state.
  const lastMessage = messages[messages.length - 1];

  // NOTE: this schema has no unread-tracking field at all (no `readBy`,
  // no `unreadCount`). If you want an unread badge, that needs to be added
  // to the backend (e.g. a `readBy: [userId]` array per message, or a
  // per-participant `lastReadAt` timestamp on the chat) — there's currently
  // nothing here to compute it from, so this is left at 0 for now.
  const unreadCount = 0;

  const fetchedProfile = useParticipantProfile(participantId, currentUserRole);

  const avatarUrl = fetchedProfile?.avatarUrl;
  const name = fetchedProfile?.name || fetchedProfile?.ownerName || "…";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors bg-gray-100
        ${isActive ? "bg-orange-50" : "hover:bg-gray-200"}
      `}
    >
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate ${unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
          >
            {name}
          </p>
          <span className="text-[11px] text-gray-400 shrink-0">
            {formatRelativeTime(lastMessage?.createdAt)}
          </span>
        </div>
        <p
          className={`text-xs truncate ${unreadCount > 0 ? "text-gray-700" : "text-gray-400"}`}
        >
          {lastMessage?.content}
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