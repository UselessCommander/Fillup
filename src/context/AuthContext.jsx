import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, fetchMe, setToken as persistToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshMe = useCallback(async () => {
    const res = await apiFetch('/me');
    if (!res.ok) {
      setMe(null);
      return;
    }
    setMe(await res.json());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch('/auth/me');
      try {
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUser(data.user);
          await refreshMe();
        } else {
          persistToken(null);
          if (!cancelled) {
            setUser(null);
            setMe(null);
          }
        }
      } catch {
        persistToken(null);
        if (!cancelled) {
          setUser(null);
          setMe(null);
        }
      } finally {
        await new Promise((r) => setTimeout(r, 1500));
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  const login = useCallback(async (email, password) => {
    const res = await apiFetch('/auth/login', { method: 'POST', json: { email, password } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || 'Kunne ikke logge ind.' };
    }
    persistToken(data.token);
    setUser(data.user);
    try {
      setMe(await fetchMe());
    } catch {
      setMe(null);
    }
    return { ok: true };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await apiFetch('/auth/register', { method: 'POST', json: { name, email, password } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || 'Kunne ikke oprette bruger.' };
    }
    persistToken(data.token);
    setUser(data.user);
    try {
      setMe(await fetchMe());
    } catch {
      setMe(null);
    }
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
    setMe(null);
  }, []);

  const patchPrefs = useCallback(
    async (patch) => {
      const res = await apiFetch('/me/prefs', { method: 'PUT', json: patch });
      if (res.ok) await refreshMe();
    },
    [refreshMe]
  );

  const clearServerPersonalData = useCallback(async () => {
    const res = await apiFetch('/me/data', { method: 'DELETE' });
    if (res.ok) await refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({
      user,
      me,
      isAuthenticated: !!user,
      authReady,
      login,
      register,
      logout,
      refreshMe,
      patchPrefs,
      clearServerPersonalData,
    }),
    [
      user,
      me,
      authReady,
      login,
      register,
      logout,
      refreshMe,
      patchPrefs,
      clearServerPersonalData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
