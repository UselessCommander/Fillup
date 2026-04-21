import app from '../server/index.js';
import { initDatabase } from '../server/db.js';

app.get('/api/setup-db', async (req, res) => {
  try {
    await initDatabase();
    res.json({ ok: 'Database seeded successfully on Vercel!' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default app;
