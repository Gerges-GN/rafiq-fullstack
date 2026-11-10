import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authFetch, clearAuthSession, getAuthToken, setAuthSession } from '../services/authFetch';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(getAuthToken() ? 'loading' : 'guest');
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    const currentRequest = ++requestId.current;
    if (!token) {
      setUser(null);
      setStatus('guest');
      return null;
    }

    setStatus((current) => current === 'authenticated' ? 'refreshing' : 'loading');
    try {
      const response = await authFetch(`${API_BASE_URL}/users/me`);
      if (currentRequest !== requestId.current || token !== getAuthToken()) return null;
      if (response.status === 401) {
        clearAuthSession(false);
        setUser(null);
        setStatus('guest');
        return null;
      }
      if (!response.ok) throw new Error('Unable to verify the signed-in account.');

      const data = await response.json();
      if (!data?.user?._id || !data.user.role) throw new Error('The server returned an invalid account.');
      setUser(data.user);
      setStatus('authenticated');
      return data.user;
    } catch (error) {
      if (currentRequest === requestId.current && token === getAuthToken()) {
        setStatus('error');
      }
      throw error;
    }
  }, []);

  const login = useCallback(async (token, remember) => {
    setAuthSession(token, remember);
    return refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    requestId.current += 1;
    clearAuthSession();
    setUser(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    const sync = () => { refresh().catch(() => {}); };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('rafiq-auth-change', sync);
    window.addEventListener('focus', sync);
    return () => {
      requestId.current += 1;
      window.removeEventListener('storage', sync);
      window.removeEventListener('rafiq-auth-change', sync);
      window.removeEventListener('focus', sync);
    };
  }, [refresh]);

  return <AuthContext.Provider value={{ user, status, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
