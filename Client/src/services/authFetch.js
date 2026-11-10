export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
}

export function setAuthSession(token, remember = false) {
  if (typeof window === 'undefined') return;
  clearAuthSession(false);
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem('token', token);
  window.dispatchEvent(new Event('rafiq-auth-change'));
}

export function clearAuthSession(notify = true) {
  if (typeof window === 'undefined') return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem('token');
    storage.removeItem('user');
    storage.removeItem('tourist');
  }
  if (notify) window.dispatchEvent(new Event('rafiq-auth-change'));
}

export function authFetch(input, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...options, headers });
}
