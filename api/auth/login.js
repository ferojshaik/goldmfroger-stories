import crypto from 'crypto';
import {
  createSignedPayload,
  getSessionCookieOptions,
  serializeCookie,
  setCorsHeaders,
} from '../lib/session.js';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map(); // per-instance; use Upstash/Vercel KV for global limit

function getClientId(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.headers['x-real-ip'];
  return ip || 'unknown';
}

function isRateLimited(req) {
  const id = getClientId(req);
  const now = Date.now();
  let entry = rateLimitMap.get(id);
  if (!entry) {
    rateLimitMap.set(id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (now >= entry.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

function getBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function constantTimeCompare(a, b) {
  const bufA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const bufB = crypto.createHash('sha256').update(b, 'utf8').digest();
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  const sendJson = (status, obj) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json(obj);
  };

  try {
    if (req.method === 'OPTIONS') {
      setCorsHeaders(req, res);
      res.status(204).end();
      return;
    }
    if (req.method !== 'POST') {
      setCorsHeaders(req, res);
      sendJson(405, { success: false, error: 'Method not allowed.' });
      return;
    }

    setCorsHeaders(req, res);

    if (isRateLimited(req)) {
      sendJson(429, { success: false, error: 'Too many attempts. Try again later.' });
      return;
    }

    const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
    if (!ADMIN_PASSWORD) {
      sendJson(500, {
        success: false,
        error: 'Admin login not configured. Set ADMIN_PASSWORD in Vercel (Project → Settings → Environment Variables) and redeploy.',
      });
      return;
    }

    const body = await getBody(req);
    const submitted = typeof body.password === 'string' ? body.password.trim() : '';
    if (!submitted) {
      sendJson(400, { success: false, error: 'Password required.' });
      return;
    }
    if (!constantTimeCompare(submitted, ADMIN_PASSWORD)) {
      sendJson(401, { success: false, error: 'Invalid password.' });
      return;
    }

    const cookieValue = createSignedPayload();
    const options = getSessionCookieOptions();
    const cookie = serializeCookie('session', cookieValue, options);
    res.setHeader('Set-Cookie', [cookie]);
    sendJson(200, { success: true });
  } catch (err) {
    setCorsHeaders(req, res);
    sendJson(500, {
      success: false,
      error: 'Server error. Check Vercel Function logs and that ADMIN_PASSWORD and (optionally) SESSION_SECRET are set.',
    });
  }
}
