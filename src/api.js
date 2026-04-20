export const TOKEN_KEY = 'fillup:token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
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
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (lat != null) params.set('lat', String(lat));
  if (lng != null) params.set('lng', String(lng));
  
  const res = await apiFetch(`/places?${params.toString()}`);
  if (!res.ok) throw new Error('Kunne ikke hente steder');
  return res.json();
}

export async function fetchPlace(id, { lat, lng } = {}) {
  const params = new URLSearchParams();
  if (lat != null) params.set('lat', String(lat));
  if (lng != null) params.set('lng', String(lng));
  
  const res = await apiFetch(`/places/${id}?${params.toString()}`);
  if (!res.ok) throw new Error('Kunne ikke hente sted');
  return res.json();
}

export async function fetchCategories() {
  const res = await apiFetch('/categories');
  if (!res.ok) throw new Error('Kunne ikke hente kategorier');
  return res.json();
}

export async function postFeedback(payload) {
  const res = await apiFetch('/feedback', { method: 'POST', json: payload });
  return res.ok ? { ok: true } : { ok: false };
}

export async function fetchMe() {
  const res = await apiFetch('/me');
  if (!res.ok) throw new Error('Kunne ikke hente dine data');
  return res.json();
}
