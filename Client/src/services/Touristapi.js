// --- INLINE API HELPERS (no separate api.js file) ---
//
// ASSUMPTIONS (change these if wrong):
//   1. Base URL — reads VITE_API_URL from your .env if set (e.g.
//      VITE_API_URL=http://localhost:5000/api), otherwise falls back to the
//      relative "/api" (only works if your dev server proxies it).
//   2. Auth token is stored in localStorage under the key "token", and the
//      backend's verifyToken middleware expects "Authorization: Bearer <token>".

const API_BASE_URL = import.meta.env?.VITE_API_URL || "/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      `Couldn't reach the server at ${API_BASE_URL}. Is the backend running and reachable from the frontend?`,
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body (e.g. some DELETE responses, or a non-JSON error page)
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const tripApi = {
  getAll: () => apiRequest(`/trips`),
};

export const profileApi = {
  getAll: () => apiRequest(`/tourguide-profiles`),
};

export const bookingApi = {
  getByTourist: (touristId) => apiRequest(`/bookings/tourist/${touristId}`),
};

export function guideLanguages(guide) {
  return Array.isArray(guide.languages) ? guide.languages : [];
}