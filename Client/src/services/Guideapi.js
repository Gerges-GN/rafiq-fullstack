const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Single source of truth for the token — checks both storages.
export function getToken() {
  const t = localStorage.getItem("token") || sessionStorage.getItem("token");
  return t;
}

export function getCurrentUserId() {
  const token = getToken();
  if (!token) {
    console.warn("[auth] getCurrentUserId: no token found in either storage");
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload.id || payload._id || payload.userId || payload.sub;
    if (!id)
      console.warn("[auth] payload has no id/_id/userId/sub field:", payload);
    return id || null;
  } catch (err) {
    console.warn("[auth] token decode failed:", err);
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    // Attach the status so callers can branch on it (e.g. 404 = "not found yet"
    // vs. a genuine failure) without re-parsing the message string.
    error.status = res.status;
    throw error;
  }

  return data;
}

// Uploads a single file to Cloudinary via the backend and returns its URL.
export async function uploadImage(file) {
  const uploadData = new FormData();
  uploadData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    body: uploadData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.message || "Image upload failed");
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.url;
}

export const profileApi = {
  getByOwnerId: (ownerId) => apiRequest(`/tourguide-profiles/owner/${ownerId}`),
  create: (payload) =>
    apiRequest(`/tourguide-profiles`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiRequest(`/tourguide-profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const tripApi = {
  getByTourGuideId: (tourGuideId) =>
    apiRequest(`/trips/tourguide/${tourGuideId}`),
  create: (payload) =>
    apiRequest(`/trips`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id) => apiRequest(`/trips/${id}`, { method: "DELETE" }),
};

export const bookingApi = {
  getByTourGuideId: (tourGuideId) =>
    apiRequest(`/bookings/tourguide/${tourGuideId}`),
  update: (id, payload) =>
    apiRequest(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const reviewApi = {
  getByTourGuideId: (tourGuideId) =>
    apiRequest(`/reviews/tourguide/${tourGuideId}`),
};

// Fallback avatar used only if the profile has none yet (e.g. brand-new guide,
// profile not created in the DB). Nothing else here is static seed data anymore.
export const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
