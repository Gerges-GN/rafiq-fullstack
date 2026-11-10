import Avatar from "../../../Components/common/Avatar";
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
}) {
  const { touristId, messages = [] } = chat;

  const isTourist = String(touristId) === String(currentUserId);
  const participant = chat.participants?.[isTourist ? "tourGuide" : "tourist"];

  const lastMessage = messages[messages.length - 1];

  const unreadCount = 0;

  const avatarUrl = participant?.avatarUrl;
  const name = participant?.name || "Unknown traveler";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors bg-gray-100
        ${isActive ? "bg-orange-50" : "hover:bg-gray-200"}
      `}
    >
      <Avatar src={avatarUrl} alt={name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate ${unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
          >
            {name}
          </p>
          <span className="text-sm text-gray-400 shrink-0">
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
