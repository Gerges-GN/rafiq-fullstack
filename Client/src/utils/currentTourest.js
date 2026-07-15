/**
 * Reads the logged-in user straight from sessionStorage — the same
 * place the rest of the app (e.g. wherever the EditProfile link is
 * built) already keeps it, under the key "user". No JWT decoding,
 * one source of truth for "who's signed in".
 */
export function getCurrentUser() {
  const raw = sessionStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Pulls the tourist's id off the stored user object, whatever key
 * it was saved under.
 */
export function getCurrentTouristId() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.id || user._id || user.userId || null;
}