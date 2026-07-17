// --- INLINE API HELPERS (no separate api.js file) ---
//
// ASSUMPTIONS (change these if wrong):
//   1. Base URL — reads VITE_API_URL from your .env if set (e.g.
//      VITE_API_URL=http://localhost:5000/api), otherwise falls back to the
//      relative "/api" (only works if your dev server proxies it).
//   2. Auth token is stored in sessionStorage under the key "token", and the
//      backend's verifyToken middleware expects "Authorization: Bearer <token>".
//   3. Logged-in user's info (id, name, etc.) is stored in sessionStorage
//      under the key "user" as JSON, alongside "token".

const API_BASE_URL = import.meta.env?.VITE_API_URL || "/api";

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("token");

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
  getGuideByOwnerId: (ownerId) => apiRequest(`/tourguide-profiles/owner/${ownerId}`),

};

export const bookingApi = {
  getByTourist: (touristId) => apiRequest(`/bookings/tourist/${touristId}`),
};

export const reviewApi = {
  create: (payload) =>
    apiRequest(`/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getByTourGuideId: (tourGuideId) =>
    apiRequest(`/reviews/tourguide/${tourGuideId}`),

  getByPlaceId: (placeId) => apiRequest(`/reviews/place/${placeId}`),

  getByReviewerId: (reviewerId) =>
    apiRequest(`/reviews/reviewer/${reviewerId}`),

  update: (id, payload) =>
    apiRequest(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id) =>
    apiRequest(`/reviews/${id}`, {
      method: "DELETE",
    }),
};

export function guideLanguages(guide) {
  return Array.isArray(guide.languages) ? guide.languages : [];
}

// Reads the logged-in user's info out of localStorage.
// Change this if your login flow stores the user differently.
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("tourist");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
