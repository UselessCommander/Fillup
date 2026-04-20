import { PLACES, ALL_CATEGORIES } from './mockData.js';

export const TOKEN_KEY = 'fillup:token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Hjælpefunktion: simulerer netværksforsinkelse
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function getMockUser() {
  const data = localStorage.getItem('fillup:mock_user');
  return data ? JSON.parse(data) : null;
}

function setMockUser(user) {
  if (user) localStorage.setItem('fillup:mock_user', JSON.stringify(user));
  else localStorage.removeItem('fillup:mock_user');
}

function getMockData() {
  const data = localStorage.getItem('fillup:mock_data');
  if (data) return JSON.parse(data);
  return { 
    favoriteIds: [], 
    recent: [], 
    prefs: { tipsEmail: false, productNews: true, shareAnalytics: false, reduceMotion: false } 
  };
}

function setMockData(data) {
  localStorage.setItem('fillup:mock_data', JSON.stringify(data));
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function enrichPlace(place, userLat, userLng) {
  let distanceM = null;
  let distanceLabel = null;
  if (userLat != null && userLng != null && Number.isFinite(Number(userLat)) && Number.isFinite(Number(userLng))) {
    distanceM = distanceMeters(userLat, userLng, place.lat, place.lng);
    distanceLabel = formatDistance(distanceM);
  }
  return { ...place, distanceMeters: distanceM, distanceLabel };
}

function matchesFilters(place, q, category) {
  if (category && category !== 'Alle') {
    const cat = category.trim();
    const ok = place.categories.some((c) => c.toLowerCase() === cat.toLowerCase()) || place.products.some((p) => p.category.toLowerCase() === cat.toLowerCase());
    if (!ok) return false;
  }
  if (!q || !q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return (
    place.name.toLowerCase().includes(needle) ||
    place.address.toLowerCase().includes(needle) ||
    place.description.toLowerCase().includes(needle) ||
    place.productSummary.toLowerCase().includes(needle) ||
    place.products.some((p) => p.name.toLowerCase().includes(needle))
  );
}

export async function apiFetch(path, options = {}) {
  await delay(); 

  // MOCK AUTH 
  if (path === '/auth/login' && options.method === 'POST') {
    const { email } = options.json || {};
    const user = { id: 1, email, name: email?.split('@')[0] || 'Bruger' };
    setMockUser(user);
    return { ok: true, json: async () => ({ token: 'mock-jwt-token', user }) };
  }
  
  if (path === '/auth/register' && options.method === 'POST') {
    const { email, name } = options.json || {};
    const user = { id: 1, email, name };
    setMockUser(user);
    return { ok: true, json: async () => ({ token: 'mock-jwt-token', user }) };
  }

  if (path === '/auth/me') {
    const token = getToken();
    const user = getMockUser();
    if (token && user) {
      return { ok: true, json: async () => ({ user }) };
    }
    return { ok: false, error: 'Ingen session' };
  }

  // MOCK BRUGERDATA
  if (path === '/me') {
    return { ok: true, json: async () => getMockData() };
  }

  if (path === '/me/favorites/toggle' && options.method === 'POST') {
    const { placeId } = options.json || {};
    const data = getMockData();
    if (data.favoriteIds.includes(placeId)) {
      data.favoriteIds = data.favoriteIds.filter(id => id !== placeId);
    } else {
      data.favoriteIds.push(placeId);
    }
    setMockData(data);
    return { ok: true, json: async () => ({ favoriteIds: data.favoriteIds }) };
  }

  if (path === '/me/recent' && options.method === 'POST') {
    const { placeId } = options.json || {};
    const data = getMockData();
    const place = PLACES.find(p => p.id === placeId);
    if (place) {
      data.recent = [
        { id: place.id, name: place.name, address: place.address, at: Date.now() }, 
        ...data.recent.filter(r => r.id !== placeId)
      ].slice(0, 12);
      setMockData(data);
    }
    return { ok: true, json: async () => ({ recent: data.recent }) };
  }

  if (path === '/me/prefs' && options.method === 'PUT') {
    const data = getMockData();
    data.prefs = { ...data.prefs, ...options.json };
    setMockData(data);
    return { ok: true, json: async () => ({ prefs: data.prefs }) };
  }

  if (path === '/me/data' && options.method === 'DELETE') {
    setMockData({ 
      favoriteIds: [], 
      recent: [], 
      prefs: { tipsEmail: false, productNews: true, shareAnalytics: false, reduceMotion: false } 
    });
    return { ok: true, json: async () => ({}) };
  }

  // Fallback hvis vi rammer et rigtigt API selvom test mode er på
  const headers = { ...(options.headers || {}) };
  if (options.json != null) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.json);
  }
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  return res;
}

export async function fetchPlaces({ q, category, lat, lng } = {}) {
  await delay();
  let list = PLACES.filter((p) => matchesFilters(p, q, category)).map((p) => enrichPlace(p, lat, lng));

  if (lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    list.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name, 'da'));
  }

  return { places: list };
}

export async function fetchPlace(id, { lat, lng } = {}) {
  await delay();
  const place = PLACES.find(p => p.id === Number(id));
  if (!place) throw new Error('Kunne ikke hente sted');
  return { place: enrichPlace(place, lat, lng) };
}

export async function fetchCategories() {
  await delay();
  return { categories: ALL_CATEGORIES };
}

export async function postFeedback(payload) {
  await delay();
  return { ok: true };
}

export async function fetchMe() {
  const res = await apiFetch('/me');
  if (!res.ok) throw new Error('Kunne ikke hente dine data');
  return res.json();
}
