// src/features/chat/components/MessageBubble.jsx
import Avatar from "../../../Components/common/Avatar";

/**
 * Single chat message bubble. Styled differently depending on
 * whether the current user sent it or received it.
 */
export default function MessageBubble({ message, isOwn }) {
  const { text, createdAt, author } = message;
  const authorName = author?.name || (isOwn ? "You" : "Traveler");

  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-1`}>
      <div className={`flex max-w-[88%] items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
        <Avatar src={author?.avatarUrl} alt={authorName} size="xs" />
        <div className="min-w-0">
          <p className={`mb-1 px-1 text-[10px] text-gray-500 ${isOwn ? "text-right" : "text-left"}`}>{authorName}</p>
          <div
            className={`
              max-w-full px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
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
      </div>
    </div>
  );
}
