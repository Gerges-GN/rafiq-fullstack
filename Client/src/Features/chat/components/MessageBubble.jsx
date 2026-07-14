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
