import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Security headers — strict
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? corsOrigin.split(',').map(s => s.trim()) : true,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '1kb' }));

const PORT = process.env.PORT || 3002;
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session store: sessionId -> { createdAt }
const sessions = new Map();

function cleanupSessions() {
  const now = Date.now();
  for (const [id, data] of sessions.entries()) {
    if (now - data.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

function createSession() {
  cleanupSessions();
  const id = crypto.randomBytes(32).toString('hex');
  sessions.set(id, { createdAt: Date.now() });
  return id;
}

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: SESSION_TTL_MS,
    path: '/',
  };
}

// Rate limit login
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// POST /api/auth/login — sets httpOnly cookie on success; password never logged
app.post('/api/auth/login', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({
      success: false,
      error: 'Admin login not configured. Set ADMIN_PASSWORD in .env.',
    });
  }
  const { password } = req.body || {};
  const submitted = typeof password === 'string' ? password.trim() : '';
  if (!submitted) {
    return res.status(400).json({ success: false, error: 'Password required.' });
  }
  if (submitted !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }
  const sessionId = createSession();
  res.cookie('session', sessionId, getSessionCookieOptions());
  res.json({ success: true });
});

// GET /api/auth/me — validates session cookie; JS cannot read it (httpOnly)
app.get('/api/auth/me', (req, res) => {
  const sessionId = req.cookies?.session;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(401).json({ admin: false });
  }
  const data = sessions.get(sessionId);
  if (!data || (Date.now() - data.createdAt > SESSION_TTL_MS)) {
    sessions.delete(sessionId);
    return res.status(401).json({ admin: false });
  }
  res.json({ admin: true });
});

// POST /api/auth/logout — clears session cookie and server-side session
app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.cookies?.session;
  if (sessionId) sessions.delete(sessionId);
  res.clearCookie('session', { path: '/', httpOnly: true, secure: isProduction, sameSite: 'strict' });
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (ADMIN_PASSWORD) {
    console.log('Admin login: ready (session cookie, httpOnly)');
  } else {
    console.warn('WARNING: ADMIN_PASSWORD not set. Add it to .env in the project root.');
  }
});
