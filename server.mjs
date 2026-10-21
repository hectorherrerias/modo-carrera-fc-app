// Production server for Docker: serves the Vite build and implements the
// /api/cloud-db sync API (same contract as the Vite dev plugin and the Vercel
// function), storing one JSON file per user in DATA_DIR. No dependencies.
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT) || 80;
const DIST_DIR = path.resolve(process.env.DIST_DIR || './dist');
const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const MAX_BODY = 20 * 1024 * 1024; // 20 MB per user document

fs.mkdirSync(DATA_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|manifest\+json)|image\/svg)/;

const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const log = (...args) => console.log(new Date().toISOString(), ...args);

const send = (req, res, status, body, headers = {}) => {
  const type = headers['Content-Type'] || 'application/json; charset=utf-8';
  let payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  const out = { ...SECURITY_HEADERS, 'Content-Type': type, ...headers };

  if (
    COMPRESSIBLE.test(type) &&
    payload.length > 1024 &&
    /\bgzip\b/.test(req.headers['accept-encoding'] || '')
  ) {
    payload = zlib.gzipSync(payload);
    out['Content-Encoding'] = 'gzip';
    out['Vary'] = 'Accept-Encoding';
  }
  out['Content-Length'] = Buffer.byteLength(payload);
  res.writeHead(status, out);
  res.end(req.method === 'HEAD' ? undefined : payload);
};

// ---------------------------------------------------------------------------
// Cloud DB API
// ---------------------------------------------------------------------------
const userFile = (rawKey) => {
  const safe = decodeURIComponent(rawKey || 'default_user')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .slice(0, 200);
  return path.join(DATA_DIR, `${safe}.json`);
};

// How much real content a career has (used to refuse destructive overwrites)
const COUNTED = ['clubs', 'seasons', 'players', 'matches', 'transfers', 'youthAcademy', 'shortlist', 'pressConferences', 'newsArticles'];
const careerScore = (career) =>
  career && typeof career === 'object'
    ? COUNTED.reduce((sum, k) => sum + (Array.isArray(career[k]) ? career[k].length : 0), 0)
    : 0;

// The untouched demo data from src/mockData.js (clubs c1/c2, no players or matches)
const isDemoTemplate = (career) => {
  const ids = (career?.clubs || []).map((c) => c.id).sort().join(',');
  return ids === 'c1,c2' && !(career.players || []).length && !(career.matches || []).length;
};

// Keep the previous version of every document in DATA_DIR/history (last 50 per user)
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const snapshot = async (file, doc) => {
  await fsp.mkdir(HISTORY_DIR, { recursive: true });
  const base = path.basename(file, '.json');
  await fsp.writeFile(path.join(HISTORY_DIR, `${base}-${Date.now()}.json`), JSON.stringify(doc), 'utf-8');
  const old = (await fsp.readdir(HISTORY_DIR)).filter((f) => f.startsWith(`${base}-`)).sort();
  for (const f of old.slice(0, Math.max(0, old.length - 50))) await fsp.unlink(path.join(HISTORY_DIR, f));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });

const handleApi = async (req, res, url) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  let rawKey = url.searchParams.get('email') || url.searchParams.get('key');
  if (!rawKey && url.pathname.startsWith('/api/cloud-db/users/')) {
    rawKey = url.pathname.replace('/api/cloud-db/users/', '').replace(/\.json$/, '');
  }
  const file = userFile(rawKey);

  if (req.method === 'GET' || req.method === 'HEAD') {
    try {
      const content = await fsp.readFile(file, 'utf-8');
      return send(req, res, 200, content, { ...cors, 'Cache-Control': 'no-store' });
    } catch {
      return send(req, res, 404, { error: 'User not found' }, cors);
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const body = await readBody(req);
    let incoming;
    try {
      incoming = JSON.parse(body);
    } catch {
      return send(req, res, 400, { error: 'Invalid JSON' }, cors);
    }

    const existing = await fsp.readFile(file, 'utf-8').then(JSON.parse).catch(() => null);
    const force = url.searchParams.get('force') === '1';

    // Profile-only saves (login, Gemini key) arrive with careerData = null:
    // keep the stored career instead of wiping it
    if (existing?.careerData && !incoming.careerData) {
      incoming.careerData = existing.careerData;
    }

    // Never let an emptier copy (e.g. the demo template from a new device)
    // replace a richer one. Deliberate resets can pass ?force=1
    const before = careerScore(existing?.careerData);
    const after = careerScore(incoming.careerData);
    if (!force && (isDemoTemplate(incoming.careerData) || (before > 0 && after < before * 0.5))) {
      log('REJECTED overwrite', path.basename(file), `score ${before} -> ${after}`);
      return send(req, res, 409, { error: 'Rejected: would replace richer data', stored: before, incoming: after }, cors);
    }

    if (existing) await snapshot(file, existing);

    // Atomic write: never leave a half-written file if the container stops
    const tmp = `${file}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(incoming), 'utf-8');
    await fsp.rename(tmp, file);
    return send(req, res, 200, { success: true, key: path.basename(file), updatedAt: Date.now() }, cors);
  }

  return send(req, res, 405, { error: 'Method not allowed' }, cors);
};

// Device backups: raw copy of a browser's saved data, written once per distinct content.
// Write-only on purpose (no GET), so nobody can read them back through the app.
const BACKUP_DIR = path.join(DATA_DIR, 'device-backups');
const handleDeviceBackup = async (req, res) => {
  if (req.method !== 'POST') return send(req, res, 405, { error: 'Method not allowed' });
  const body = await readBody(req);
  let parsed;
  try { parsed = JSON.parse(body); } catch { return send(req, res, 400, { error: 'Invalid JSON' }); }
  const hash = crypto.createHash('sha1').update(JSON.stringify(parsed.storage || parsed)).digest('hex').slice(0, 12);
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const seen = (await fsp.readdir(BACKUP_DIR)).some((f) => f.includes(hash));
  if (!seen) {
    await fsp.writeFile(path.join(BACKUP_DIR, `${Date.now()}-${hash}.json`), body, 'utf-8');
    log('Device backup stored', hash, `${Math.round(body.length / 1024)} KB`);
  }
  return send(req, res, 200, { success: true });
};

// ---------------------------------------------------------------------------
// Static files + SPA fallback
// ---------------------------------------------------------------------------
const serveStatic = async (req, res, url) => {
  let pathname = decodeURIComponent(url.pathname);
  let filePath = path.normalize(path.join(DIST_DIR, pathname));
  if (!filePath.startsWith(DIST_DIR)) return send(req, res, 403, { error: 'Forbidden' });

  let stat = await fsp.stat(filePath).catch(() => null);
  if (stat?.isDirectory()) {
    filePath = path.join(filePath, 'index.html');
    stat = await fsp.stat(filePath).catch(() => null);
  }

  const isAsset = !!path.extname(pathname) && !pathname.endsWith('.html');
  if (!stat) {
    if (isAsset) return send(req, res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const content = await fsp.readFile(filePath);
  const cache =
    ext === '.html'
      ? 'no-cache'
      : pathname.startsWith('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=86400';
  return send(req, res, 200, content, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cache,
  });
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/healthz') return send(req, res, 200, { status: 'ok' });
    if (url.pathname === '/api/device-backup') return await handleDeviceBackup(req, res);
    if (url.pathname.startsWith('/api/cloud-db') || url.pathname.startsWith('/api/sync')) {
      const result = await handleApi(req, res, url);
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        log(req.method, url.pathname, res.statusCode);
      }
      return result;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(req, res, 405, { error: 'Method not allowed' });
    }
    return await serveStatic(req, res, url);
  } catch (err) {
    log('ERROR', req.method, url.pathname, err.message);
    if (!res.headersSent) send(req, res, err.status || 500, { error: err.status ? err.message : 'Internal error' });
  }
});

server.listen(PORT, () => log(`Modo Carrera FC listening on :${PORT} (data: ${DATA_DIR})`));

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
