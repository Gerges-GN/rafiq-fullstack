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
