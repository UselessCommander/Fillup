import { createContext, useCallback, useContext, useMemo } from 'react';
import { apiFetch } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { me, refreshMe, isAuthenticated } = useAuth();
  const favoriteIds = me?.favoriteIds ?? [];
  const recent = me?.recent ?? [];

  const isFavorite = useCallback((id) => favoriteIds.includes(id), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (id) => {
      if (!isAuthenticated) return;
      const res = await apiFetch('/me/favorites/toggle', { method: 'POST', json: { placeId: id } });
      if (res.ok) await refreshMe();
    },
    [isAuthenticated, refreshMe]
  );

  const addRecent = useCallback(
    async (place) => {
      if (!place?.id || !isAuthenticated) return;
      const res = await apiFetch('/me/recent', { method: 'POST', json: { placeId: place.id } });
      if (res.ok) await refreshMe();
    },
    [isAuthenticated, refreshMe]
  );

  const clearFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await apiFetch('/me/favorites', { method: 'DELETE' });
    if (res.ok) await refreshMe();
  }, [isAuthenticated, refreshMe]);

  const clearRecent = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await apiFetch('/me/recent', { method: 'DELETE' });
    if (res.ok) await refreshMe();
  }, [isAuthenticated, refreshMe]);

  const clearAllPersonal = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await apiFetch('/me/data', { method: 'DELETE' });
    if (res.ok) await refreshMe();
  }, [isAuthenticated, refreshMe]);

  const value = useMemo(
    () => ({
      favoriteIds,
      toggleFavorite,
      isFavorite,
      recent,
      addRecent,
      clearFavorites,
      clearRecent,
      clearAllPersonal,
    }),
    [
      favoriteIds,
      toggleFavorite,
      isFavorite,
      recent,
      addRecent,
      clearFavorites,
      clearRecent,
      clearAllPersonal,
    ]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
