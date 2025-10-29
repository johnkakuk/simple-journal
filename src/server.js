import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { prisma } from './db.js';
import fs from 'node:fs';
import https from 'node:https';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] })); // allow localhost in dev
app.use(pinoHttp());
app.use(express.static('public'));
app.use('/api/', rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/health', (req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
});

// HTTP stuff
const httpPort = process.env.PORT || 8080;
const httpsPort = process.env.HTTPS_PORT || 8443;

app.listen(httpPort, () => console.log(`HTTP  on  http://localhost:${httpPort}`));

const creds = {
  key:  fs.readFileSync('certs/localhost+2-key.pem'),
  cert: fs.readFileSync('certs/localhost+2.pem'),
};
https.createServer(creds, app).listen(httpsPort, () =>
  console.log(`HTTPS on https://localhost:${httpsPort}`)
);

// Prisma stuff
const iso = s => /^\d{4}-\d{2}-\d{2}$/.test(s); // YYYY-MM-DD

// List (optional ranges)
app.get('/api/entries', async (req, res) => {
  const { from, to } = req.query;
  const where = {
    AND: [
      from && iso(from) ? { date: { gte: from } } : {},
      to   && iso(to)   ? { date: { lte: to } }   : {},
    ],
  };
  const rows = await prisma.entry.findMany({
    where, orderBy: { date: 'desc' },
    select: { date: true, content: true, updatedAt: true }
  });
  res.json(rows);
});

// Get one
app.get('/api/entries/:date', async (req, res) => {
  const { date } = req.params;
  if (!iso(date)) return res.status(400).json({ error: 'Bad date' });
  const row = await prisma.entry.findUnique({ where: { date } });
  if (!row) return res.sendStatus(404);
  res.json(row);
});

// Create (one per day)
app.post('/api/entries', async (req, res) => {
  const { date, content } = req.body ?? {};
  if (!iso(date) || typeof content !== 'string')
    return res.status(400).json({ error: 'Invalid payload' });

  try {
    const row = await prisma.entry.create({ data: { date, content } });
    res.status(201).json(row);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Entry exists' });
    throw e;
  }
});

// Update (create-or-replace)
app.put('/api/entries/:date', async (req, res) => {
  const { date } = req.params;
  const { content } = req.body ?? {};
  if (!iso(date) || typeof content !== 'string')
    return res.status(400).json({ error: 'Invalid payload' });

  try {
    const row = await prisma.entry.upsert({
      where: { date },
      update: { content },
      create: { date, content }
    });
    return res.status(200).json(row);
  } catch (err) {
    req.log?.error?.(err);
    return res.status(500).json({ error: 'Upsert failed' });
  }
});

// Delete (optional)
app.delete('/api/entries/:date', async (req, res) => {
  const { date } = req.params;
  if (!iso(date)) return res.status(400).json({ error: 'Bad date' });
  try { await prisma.entry.delete({ where: { date } }); res.sendStatus(204); }
  catch { res.sendStatus(404); }
});