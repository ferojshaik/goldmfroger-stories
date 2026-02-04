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
    if (submitted !== ADMIN_PASSWORD) {
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
};
