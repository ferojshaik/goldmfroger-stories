const {
  createSignedPayload,
  getSessionCookieOptions,
  serializeCookie,
  setCorsHeaders,
} = require('../lib/session');

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

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed.' });
    return;
  }

  setCorsHeaders(req, res);

  const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
  if (!ADMIN_PASSWORD) {
    res.status(500).json({
      success: false,
      error: 'Admin login not configured. Set ADMIN_PASSWORD in Vercel env.',
    });
    return;
  }

  const body = await getBody(req);
  const submitted = typeof body.password === 'string' ? body.password.trim() : '';
  if (!submitted) {
    res.status(400).json({ success: false, error: 'Password required.' });
    return;
  }
  if (submitted !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, error: 'Invalid password.' });
    return;
  }

  const cookieValue = createSignedPayload();
  const options = getSessionCookieOptions();
  const cookie = serializeCookie('session', cookieValue, options);
  res.setHeader('Set-Cookie', [cookie]);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ success: true });
};
