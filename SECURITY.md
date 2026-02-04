# Security — Owner login

## What’s in place

- **Password** — Stored only in `.env` on the server. Never in frontend code or in the browser.
- **Session** — After login, the server sets an **httpOnly** cookie. JavaScript cannot read it, so XSS cannot steal your session.
- **Session (Vercel)** — On Vercel, sessions are **stateless**: HMAC-signed cookie only (no server-side store). Cookie is `SameSite=Strict`, `Secure` in production.
- **Session (local Express)** — When running `npm run server`, session IDs are stored in memory; cookie settings are the same.
- **Rate limiting** — Login is limited to 5 attempts per 15 minutes (Express locally; serverless login handler on Vercel uses per-instance limit; consider Upstash/Vercel KV for global limit).
- **Password comparison** — Constant-time comparison (no timing leaks) in the API login handler.
- **Headers** — Helmet on Express (local); `vercel.json` sets HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy in production.
- **Logout** — Clears the cookie and (on Express) the server-side session.
- **CORS** — In production, `Access-Control-Allow-Origin` is set only from `CORS_ORIGIN` (no reflection of request origin).
- **Story body** — Rendered as plain text (no raw HTML) to prevent XSS.

## For production (do all of these)

1. **Strong password** — Set `ADMIN_PASSWORD` in `.env` to a long, random value (e.g. 20+ characters). Generate one with: `openssl rand -base64 24`. Never use a simple or default password like `GoldMFroger2024`.
2. **HTTPS** — Serve the site and API over HTTPS only. Set `NODE_ENV=production` in `.env` so the session cookie is sent with `Secure` (HTTPS-only).
3. **CORS** — Set `CORS_ORIGIN` in `.env` to your real frontend URL, e.g. `https://yoursite.com` (no trailing slash). Do not use `*` when using cookies.
4. **Secrets** — Keep `.env` out of version control. Do not commit `ADMIN_PASSWORD`.

For a full penetration-test summary and applied fixes, see **[SECURITY-AUDIT.md](./SECURITY-AUDIT.md)**.

No system is “unhackable,” but these steps make it much harder for an attacker to steal your session or password.
