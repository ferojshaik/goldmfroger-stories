# Security — Owner login

## What’s in place

- **Password** — Stored only in `.env` on the server. Never in frontend code or in the browser.
- **Session** — After login, the server sets an **httpOnly** cookie. JavaScript cannot read it, so XSS cannot steal your session.
- **Session storage** — Session IDs are stored on the server (in memory). Cookie is `SameSite=Strict`, `Secure` in production.
- **Rate limiting** — Login is limited to 5 attempts per 15 minutes.
- **Headers** — Helmet sets HSTS, XSS filter, no-sniff, referrer policy.
- **Logout** — Clears the cookie and the server-side session.

## For production (do all of these)

1. **Strong password** — Set `ADMIN_PASSWORD` in `.env` to a long, random value (e.g. 20+ characters). Generate one with: `openssl rand -base64 24`. Never use a simple or default password like `GoldMFroger2024`.
2. **HTTPS** — Serve the site and API over HTTPS only. Set `NODE_ENV=production` in `.env` so the session cookie is sent with `Secure` (HTTPS-only).
3. **CORS** — Set `CORS_ORIGIN` in `.env` to your real frontend URL, e.g. `https://yoursite.com` (no trailing slash). Do not use `*` when using cookies.
4. **Secrets** — Keep `.env` out of version control. Do not commit `ADMIN_PASSWORD`.

No system is “unhackable,” but these steps make it much harder for an attacker to steal your session or password.
