import pg from 'pg';
import { PLACES, ALL_CATEGORIES } from './data.js';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const usePg = !!connectionString;

if (!usePg) {
  console.log('[db] Mangler DATABASE_URL i .env. Bruger IN-MEMORY database fallback til lokal test.');
}

const useSsl =
  usePg &&
  process.env.DATABASE_SSL !== 'false' &&
  (connectionString.includes('supabase.co') ||
    connectionString.includes('sslmode=require') ||
    process.env.DATABASE_SSL === 'true');

export const pool = usePg
  ? new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    })
  : { end: async () => {} };

export { ALL_CATEGORIES };

export const DEFAULT_PREFS = {
  tipsEmail: false,
  productNews: true,
  shareAnalytics: false,
  reduceMotion: false,
};

// --- IN MEMORY STATE ---
const mem = {
  users: [],
  favorites: [], // { userId, placeId }
  recent: [], // { id, userId, placeId, visitedAt }
  settings: {}, // userId -> prefs_json
  feedback: [],
  userIdSeq: 1,
  recentIdSeq: 1,
};
// -----------------------

const DDL_STATEMENTS = [
  // ... (PG DDL) ...
  `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS places (id INTEGER PRIMARY KEY, name TEXT NOT NULL, address TEXT NOT NULL, lat DOUBLE PRECISION NOT NULL, lng DOUBLE PRECISION NOT NULL, description TEXT NOT NULL, categories_json TEXT NOT NULL, product_summary TEXT NOT NULL, products_json TEXT NOT NULL, rating DOUBLE PRECISION)`,
  `CREATE TABLE IF NOT EXISTS user_favorites (user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE, PRIMARY KEY (user_id, place_id))`,
  `CREATE TABLE IF NOT EXISTS user_recent (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE, visited_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS user_settings (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, prefs_json TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS feedback (id SERIAL PRIMARY KEY, topic TEXT, name TEXT, email TEXT, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS idx_recent_user ON user_recent(user_id, visited_at DESC)`,
];

export async function initDatabase() {
  if (!usePg) {
    console.log('[db] In-memory mode klar. Data nulstilles når serveren genstartes.');
    return;
  }
  for (const sql of DDL_STATEMENTS) {
    await pool.query(sql);
  }
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM places');
  if (rows[0].c === 0) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ins = `INSERT INTO places (id, name, address, lat, lng, description, categories_json, product_summary, products_json, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
      for (const p of PLACES) {
        await client.query(ins, [
          p.id, p.name, p.address, p.lat, p.lng, p.description,
          JSON.stringify(p.categories), p.productSummary, JSON.stringify(p.products), p.rating ?? null,
        ]);
      }
      await client.query('COMMIT');
      console.log('[db] Seeded', PLACES.length, 'places (PostgreSQL)');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export function rowToPlace(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: Number(row.lat),
    lng: Number(row.lng),
    description: row.description,
    categories: typeof row.categories_json === 'string' ? JSON.parse(row.categories_json) : row.categories_json,
    productSummary: row.product_summary,
    products: typeof row.products_json === 'string' ? JSON.parse(row.products_json) : row.products_json,
    rating: row.rating != null ? Number(row.rating) : null,
  };
}

export async function getAllPlacesFromDb() {
  if (!usePg) return [...PLACES];
  const { rows } = await pool.query('SELECT * FROM places ORDER BY id');
  return rows.map(rowToPlace);
}

export async function getPlaceByIdFromDb(id) {
  if (!usePg) return PLACES.find((p) => p.id === id) || null;
  const { rows } = await pool.query('SELECT * FROM places WHERE id = $1', [id]);
  return rowToPlace(rows[0]);
}

export async function findUserByEmail(email) {
  const e = String(email).trim().toLowerCase();
  if (!usePg) return mem.users.find((u) => u.email === e) || null;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [e]);
  return rows[0] ?? null;
}

export async function findUserById(id) {
  if (!usePg) {
    const u = mem.users.find((u) => u.id === id);
    return u ? { id: u.id, email: u.email, name: u.name, created_at: u.created_at } : null;
  }
  const { rows } = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createUser(email, name, passwordHash) {
  const e = String(email).trim().toLowerCase();
  const n = String(name).trim();
  if (!usePg) {
    if (mem.users.some((u) => u.email === e)) {
      const err = new Error('E-mail er allerede registreret.');
      err.code = '23505';
      throw err;
    }
    const userId = mem.userIdSeq++;
    mem.users.push({ id: userId, email: e, name: n, password_hash: passwordHash, created_at: new Date().toISOString() });
    mem.settings[userId] = JSON.stringify(DEFAULT_PREFS);
    return userId;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [u] } = await client.query('INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id', [e, n, passwordHash]);
    const userId = Number(u.id);
    await client.query('INSERT INTO user_settings (user_id, prefs_json) VALUES ($1, $2)', [userId, JSON.stringify(DEFAULT_PREFS)]);
    await client.query('COMMIT');
    return userId;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getFavoriteIds(userId) {
  if (!usePg) return mem.favorites.filter((f) => f.userId === userId).map((f) => f.placeId);
  const { rows } = await pool.query('SELECT place_id FROM user_favorites WHERE user_id = $1 ORDER BY place_id', [userId]);
  return rows.map((r) => r.place_id);
}

export async function toggleFavoriteDb(userId, placeId) {
  if (!usePg) {
    const idx = mem.favorites.findIndex((f) => f.userId === userId && f.placeId === placeId);
    if (idx !== -1) {
      mem.favorites.splice(idx, 1);
      return false;
    }
    mem.favorites.push({ userId, placeId });
    return true;
  }
  const del = await pool.query('DELETE FROM user_favorites WHERE user_id = $1 AND place_id = $2 RETURNING 1', [userId, placeId]);
  if (del.rowCount > 0) return false;
  await pool.query('INSERT INTO user_favorites (user_id, place_id) VALUES ($1, $2)', [userId, placeId]);
  return true;
}

export async function clearFavoritesDb(userId) {
  if (!usePg) {
    mem.favorites = mem.favorites.filter((f) => f.userId !== userId);
    return;
  }
  await pool.query('DELETE FROM user_favorites WHERE user_id = $1', [userId]);
}

export async function addRecentDb(userId, placeId) {
  if (!usePg) {
    mem.recent.push({ id: mem.recentIdSeq++, userId, placeId, visitedAt: Date.now() });
    // Keep only last 50
    const userRecents = mem.recent.filter((r) => r.userId === userId).sort((a, b) => b.visitedAt - a.visitedAt);
    if (userRecents.length > 50) {
      const toRemove = userRecents.slice(50).map((r) => r.id);
      mem.recent = mem.recent.filter((r) => !toRemove.includes(r.id));
    }
    return;
  }
  await pool.query('INSERT INTO user_recent (user_id, place_id, visited_at) VALUES ($1, $2, $3)', [userId, placeId, Date.now()]);
  await pool.query(`DELETE FROM user_recent WHERE user_id = $1 AND id NOT IN (SELECT id FROM user_recent WHERE user_id = $1 ORDER BY visited_at DESC LIMIT 50)`, [userId]);
}

export async function getRecentDb(userId) {
  if (!usePg) {
    const userRecents = mem.recent.filter((r) => r.userId === userId).sort((a, b) => b.visitedAt - a.visitedAt);
    const seen = new Set();
    const out = [];
    for (const r of userRecents) {
      if (seen.has(r.placeId)) continue;
      seen.add(r.placeId);
      const p = PLACES.find((pl) => pl.id === r.placeId);
      if (p) {
        out.push({ id: p.id, name: p.name, address: p.address, at: r.visitedAt });
        if (out.length >= 12) break;
      }
    }
    return out;
  }
  const { rows } = await pool.query(
    `SELECT ur.place_id AS id, p.name, p.address, ur.visited_at AS at FROM user_recent ur JOIN places p ON p.id = ur.place_id WHERE ur.user_id = $1 ORDER BY ur.visited_at DESC LIMIT 80`,
    [userId]
  );
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push({ id: r.id, name: r.name, address: r.address, at: typeof r.at === 'string' ? Number(r.at) : r.at });
    if (out.length >= 12) break;
  }
  return out;
}

export async function clearRecentDb(userId) {
  if (!usePg) {
    mem.recent = mem.recent.filter((r) => r.userId !== userId);
    return;
  }
  await pool.query('DELETE FROM user_recent WHERE user_id = $1', [userId]);
}

export async function getPrefsDb(userId) {
  if (!usePg) {
    try {
      return { ...DEFAULT_PREFS, ...JSON.parse(mem.settings[userId] || '{}') };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }
  const { rows } = await pool.query('SELECT prefs_json FROM user_settings WHERE user_id = $1', [userId]);
  const row = rows[0];
  if (!row) return { ...DEFAULT_PREFS };
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(row.prefs_json) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function savePrefsDb(userId, prefs) {
  if (!usePg) {
    mem.settings[userId] = JSON.stringify(prefs);
    return;
  }
  await pool.query('UPDATE user_settings SET prefs_json = $1 WHERE user_id = $2', [JSON.stringify(prefs), userId]);
}

export async function clearUserDataDb(userId) {
  await clearFavoritesDb(userId);
  await clearRecentDb(userId);
  await savePrefsDb(userId, { ...DEFAULT_PREFS });
}

export async function insertFeedback({ topic, name, email, message }) {
  if (!usePg) {
    mem.feedback.push({ topic, name, email, message, created_at: new Date().toISOString() });
    return;
  }
  await pool.query('INSERT INTO feedback (topic, name, email, message) VALUES ($1, $2, $3, $4)', [topic ?? null, name ?? null, email ?? null, message]);
}

