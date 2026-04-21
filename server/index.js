import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  initDatabase,
  pool,
  ALL_CATEGORIES,
  getAllPlacesFromDb,
  getPlaceByIdFromDb,
  findUserByEmail,
  findUserById,
  createUser,
  getFavoriteIds,
  toggleFavoriteDb,
  clearFavoritesDb,
  addRecentDb,
  getRecentDb,
  clearRecentDb,
  getPrefsDb,
  savePrefsDb,
  clearUserDataDb,
  insertFeedback,
} from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fillup-dev-secret-skift-i-produktion';

app.use(cors());
app.use(express.json());

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function enrichPlace(place, userLat, userLng) {
  let distanceM = null;
  let distanceLabel = null;
  if (userLat != null && userLng != null && Number.isFinite(userLat) && Number.isFinite(userLng)) {
    distanceM = distanceMeters(userLat, userLng, place.lat, place.lng);
    distanceLabel = formatDistance(distanceM);
  }
  return {
    ...place,
    distanceMeters: distanceM,
    distanceLabel,
  };
}

function matchesFilters(place, q, category) {
  if (category && category !== 'Alle') {
    const cat = category.trim();
    const ok =
      place.categories.some((c) => c.toLowerCase() === cat.toLowerCase()) ||
      place.products.some((p) => p.category.toLowerCase() === cat.toLowerCase());
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

function signToken(userRow) {
  return jwt.sign(
    { sub: userRow.id, email: userRow.email, name: userRow.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Ikke logget ind' });
    return;
  }
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Ugyldig eller udløbet session' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/categories', (_req, res) => {
  res.json({ categories: ALL_CATEGORIES });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    const n = String(name ?? '').trim();
    const e = String(email ?? '').trim().toLowerCase();
    if (!n || !e || !password) {
      res.status(400).json({ error: 'Udfyld alle felter.' });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ error: 'Adgangskoden skal være mindst 6 tegn.' });
      return;
    }
    if (await findUserByEmail(e)) {
      res.status(409).json({ error: 'E-mail er allerede registreret.' });
      return;
    }
    const hash = bcrypt.hashSync(String(password), 10);
    const userId = await createUser(e, n, hash);
    const user = await findUserById(userId);
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'E-mail er allerede registreret.' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke oprette bruger.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const e = String(email ?? '').trim().toLowerCase();
  if (!e || !password) {
    res.status(400).json({ error: 'E-mail og adgangskode påkrævet.' });
    return;
  }
  const row = await findUserByEmail(e);
  if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
    res.status(401).json({ error: 'Forkert e-mail eller adgangskode.' });
    return;
  }
  const user = await findUserById(row.id);
  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    res.status(401).json({ error: 'Bruger findes ikke' });
    return;
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const [favoriteIds, recent, prefs] = await Promise.all([
    getFavoriteIds(userId),
    getRecentDb(userId),
    getPrefsDb(userId),
  ]);
  res.json({ favoriteIds, recent, prefs });
});

app.post('/api/me/favorites/toggle', authMiddleware, async (req, res) => {
  const placeId = Number(req.body?.placeId);
  if (!Number.isFinite(placeId)) {
    res.status(400).json({ error: 'placeId påkrævet' });
    return;
  }
  if (!(await getPlaceByIdFromDb(placeId))) {
    res.status(404).json({ error: 'Sted findes ikke' });
    return;
  }
  await toggleFavoriteDb(req.user.id, placeId);
  res.json({ favoriteIds: await getFavoriteIds(req.user.id) });
});

app.post('/api/me/recent', authMiddleware, async (req, res) => {
  const placeId = Number(req.body?.placeId);
  if (!Number.isFinite(placeId)) {
    res.status(400).json({ error: 'placeId påkrævet' });
    return;
  }
  if (!(await getPlaceByIdFromDb(placeId))) {
    res.status(404).json({ error: 'Sted findes ikke' });
    return;
  }
  await addRecentDb(req.user.id, placeId);
  res.json({ recent: await getRecentDb(req.user.id) });
});

app.put('/api/me/prefs', authMiddleware, async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Ugyldig payload' });
    return;
  }
  const merged = { ...(await getPrefsDb(req.user.id)), ...body };
  await savePrefsDb(req.user.id, merged);
  res.json({ prefs: merged });
});

app.delete('/api/me/favorites', authMiddleware, async (req, res) => {
  await clearFavoritesDb(req.user.id);
  res.json({ favoriteIds: [] });
});

app.delete('/api/me/recent', authMiddleware, async (req, res) => {
  await clearRecentDb(req.user.id);
  res.json({ recent: [] });
});

app.delete('/api/me/data', authMiddleware, async (req, res) => {
  await clearUserDataDb(req.user.id);
  res.json({
    ok: true,
    favoriteIds: [],
    recent: [],
    prefs: await getPrefsDb(req.user.id),
  });
});

app.get('/api/places', async (req, res) => {
  const PLACES = await getAllPlacesFromDb();
  const q = req.query.q ?? '';
  const category = req.query.category ?? 'Alle';
  const lat = req.query.lat != null ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng != null ? parseFloat(req.query.lng) : null;

  let list = PLACES.filter((p) => matchesFilters(p, q, category)).map((p) => enrichPlace(p, lat, lng));

  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    list.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name, 'da'));
  }

  res.json({ places: list });
});

app.get('/api/places/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const place = await getPlaceByIdFromDb(id);
  if (!place) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const lat = req.query.lat != null ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng != null ? parseFloat(req.query.lng) : null;
  res.json({ place: enrichPlace(place, lat, lng) });
});

app.post('/api/feedback', async (req, res) => {
  const { name, email, message, topic } = req.body ?? {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Besked påkrævet' });
    return;
  }
  try {
    await insertFeedback({
      topic: topic ?? null,
      name: name ?? null,
      email: email ?? null,
      message: message.trim().slice(0, 2000),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kunne ikke gemme feedback.' });
  }
});

async function start() {
  await initDatabase();

  const server = app.listen(PORT, () => {
    console.log(`FillUp API listening on http://localhost:${PORT}`);
    console.log('PostgreSQL via DATABASE_URL (Supabase eller anden host)');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} er allerede i brug. Stop den anden proces (fx: lsof -i :${PORT}) eller kør med PORT=3002 node server/index.js`
      );
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  const shutdown = async () => {
    server.close(() => {});
    await pool.end().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
