import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/** Fallback når GPS ikke er tilgængelig — centrum København */
export const FALLBACK_COORDS = { lat: 55.681, lng: 12.57 };

const CACHE_KEY = 'fillup:last-loc';
const CACHE_MAX_AGE_MS = 8 * 60 * 1000;

function loadCachedCoords() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.lat !== 'number' || typeof data.lng !== 'number' || typeof data.at !== 'number') return null;
    if (Date.now() - data.at > CACHE_MAX_AGE_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return { lat: data.lat, lng: data.lng, accuracy: data.accuracy };
  } catch {
    return null;
  }
}

function saveCachedCoords(coords) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...coords, at: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

function readPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 18000, maximumAge: 120_000 }
    );
  });
}

const UserLocationContext = createContext(null);

function initialLocationState() {
  const cached = loadCachedCoords();
  return {
    coords: cached,
    status: cached ? 'granted' : 'idle',
  };
}

export function UserLocationProvider({ children }) {
  const [{ coords, status }, setState] = useState(initialLocationState);

  const effective = useMemo(
    () => (coords ? { lat: coords.lat, lng: coords.lng } : FALLBACK_COORDS),
    [coords]
  );

  const usingGps = coords != null;

  const refreshLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: 'unsupported' }));
      throw new Error('unsupported');
    }
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const c = await readPosition();
      saveCachedCoords(c);
      setState({ coords: c, status: 'granted' });
      return c;
    } catch (err) {
      const next =
        err?.code === 1 ? 'denied' : err?.message === 'unsupported' ? 'unsupported' : 'error';
      setState((s) => ({ ...s, status: next }));
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      coords,
      effective,
      usingGps,
      status,
      refreshLocation,
    }),
    [coords, effective, usingGps, status, refreshLocation]
  );

  return <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>;
}

export function useUserLocation() {
  const ctx = useContext(UserLocationContext);
  if (!ctx) throw new Error('useUserLocation must be used within UserLocationProvider');
  return ctx;
}
