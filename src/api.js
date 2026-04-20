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
    delete options.json;
  }
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  return res;
}

const base = '/api';

export async function fetchPlaces({ q, category, lat, lng } = {}) {
  const u = new URLSearchParams();
  if (q) u.set('q', q);
  if (category) u.set('category', category);
  if (lat != null) u.set('lat', String(lat));
  if (lng != null) u.set('lng', String(lng));
  const res = await fetch(`${base}/places?${u.toString()}`);
  if (!res.ok) throw new Error('Kunne ikke hente steder');
  return res.json();
}

export async function fetchPlace(id, { lat, lng } = {}) {
  const u = new URLSearchParams();
  if (lat != null) u.set('lat', String(lat));
  if (lng != null) u.set('lng', String(lng));
  const res = await fetch(`${base}/places/${id}?${u.toString()}`);
  if (!res.ok) throw new Error('Kunne ikke hente sted');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${base}/categories`);
  if (!res.ok) throw new Error('Kunne ikke hente kategorier');
  return res.json();
}

export async function postFeedback(payload) {
  const res = await fetch(`${base}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Kunne ikke sende besked');
  return res.json();
}

export async function fetchMe() {
  const res = await apiFetch('/me');
  if (!res.ok) throw new Error('Kunne ikke hente dine data');
  return res.json();
}
