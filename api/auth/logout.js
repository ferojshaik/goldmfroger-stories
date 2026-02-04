import { setCorsHeaders } from '../lib/session.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  setCorsHeaders(req, res);
  res.setHeader('Content-Type', 'application/json');

  const isProduction = process.env.NODE_ENV === 'production';
  const clearCookie =
    'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' +
    (isProduction ? '; Secure' : '');
  res.setHeader('Set-Cookie', [clearCookie]);
  res.status(200).json({ ok: true });
}
