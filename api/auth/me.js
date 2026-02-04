import { verifySignedCookie, setCorsHeaders } from '../lib/session.js';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ admin: false });
    return;
  }

  setCorsHeaders(req, res);
  res.setHeader('Content-Type', 'application/json');

  const cookieHeader = req.headers.cookie;
  const valid = verifySignedCookie(cookieHeader);
  res.status(200).json({ admin: valid });
}
