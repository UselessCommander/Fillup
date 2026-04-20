import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';

const UserPrefsContext = createContext(null);

const FALLBACK_PREFS = {
  tipsEmail: false,
  productNews: true,
  shareAnalytics: false,
  reduceMotion: false,
};

export function UserPrefsProvider({ children }) {
  const { me, patchPrefs, isAuthenticated } = useAuth();

  const prefs = useMemo(
    () => ({
      ...FALLBACK_PREFS,
      ...(me?.prefs ?? {}),
    }),
    [me]
  );

  const update = useCallback(
    async (patch) => {
      if (!isAuthenticated) return;
      await patchPrefs(patch);
    },
    [isAuthenticated, patchPrefs]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('fillup-reduce-motion', prefs.reduceMotion);
  }, [prefs.reduceMotion]);

  const value = useMemo(() => ({ prefs, update }), [prefs, update]);

  return <UserPrefsContext.Provider value={value}>{children}</UserPrefsContext.Provider>;
}

export function useUserPrefs() {
  const ctx = useContext(UserPrefsContext);
  if (!ctx) throw new Error('useUserPrefs must be used within UserPrefsProvider');
  return ctx;
}
