// src/features/chat/services/chatApi.js

const BASE_URL = import.meta.env.VITE_API_URL;



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