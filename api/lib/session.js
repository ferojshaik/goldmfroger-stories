import crypto from 'crypto';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const COOKIE_NAME = 'session';

function getSecret() {
  const secret = (process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '').trim();
  if (!secret) throw new Error('SESSION_SECRET or ADMIN_PASSWORD must be set');
  return secret;
}

function createSignedPayload() {
  const payload = {
    id: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + SESSION_TTL_MS,
  };
  const secret = getSecret();
  const raw = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('base64url');
  const value = Buffer.from(raw, 'utf8').toString('base64url') + '.' + sig;
  return value;
}

function verifySignedCookie(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return false;
  const match = cookieHeader.match(new RegExp(COOKIE_NAME + '=([^;]+)'));
  const value = match ? match[1].trim() : null;
  if (!value) return false;
  const [payloadB64, sig] = value.split('.');
  if (!payloadB64 || !sig) return false;
  try {
    const raw = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(raw);
    if (payload.exp < Date.now()) return false;
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(raw).digest('base64url');
    return crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expectedSig, 'utf8'));
  } catch {
    return false;
  }
}

function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: '/',
  };
}

function serializeCookie(name, value, options) {
  const parts = [name + '=' + encodeURIComponent(value)];
  if (options.maxAge != null) parts.push('Max-Age=' + options.maxAge);
  if (options.path) parts.push('Path=' + options.path);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push('SameSite=' + options.sameSite);
  return parts.join('; ');
}

function setCorsHeaders(req, res) {
  const origin = (process.env.CORS_ORIGIN || req.headers.origin || '').trim();
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export {
  COOKIE_NAME,
  createSignedPayload,
  verifySignedCookie,
  getSessionCookieOptions,
  serializeCookie,
  setCorsHeaders,
};
