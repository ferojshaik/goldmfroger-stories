# Security Audit — Penetration Test Summary

**Site:** https://goldmfroger-stories.vercel.app/  
**Scope:** Owner login (Creator Studio), session handling, API, frontend.  
**Date:** 2025-02-04

---

## Executive summary

The site uses solid basics: password only in env, httpOnly signed session cookie, no visible admin link. **On Vercel**, login has **no rate limiting** (only the local Express server has it), and there are smaller issues: timing-sensitive password check, CORS fallback, XSS in story body, and missing security headers on serverless. Fixes are applied in code and documented below.

---

## What’s already strong

| Area | Status |
|------|--------|
| **Password storage** | Not in frontend or repo; only in server env (`ADMIN_PASSWORD`). |
| **Session cookie** | httpOnly, Secure in prod, SameSite=Strict, HMAC-signed (stateless on Vercel). |
| **Admin entry point** | No link on site; only `/#/owner` — security through obscurity plus strong password. |
| **Credentials on wire** | Login over HTTPS; password sent in POST body, not URL. |
| **Session verification** | `api/auth/me` uses signed cookie with `crypto.timingSafeEqual` for signature. |
| **Logout** | Clears cookie and (on Express) server-side session. |
| **Creator data** | Stories/brand in localStorage only; no backend DB to inject. |

---

## Findings and fixes

### 1. **Critical: No rate limiting on login (Vercel)**

- **Risk:** On Vercel, `/api/auth/login` is a serverless function. Rate limiting exists only in `server/index.js` (Express, local). In production an attacker can brute-force the password.
- **Fix:** In-memory rate limiter added in `api/auth/login.js` (per serverless instance). For production at scale, use a shared store (e.g. **Upstash Redis** or **Vercel KV**) so limits apply across all instances.
- **Recommendation:** Set `ADMIN_PASSWORD` to a long random value (e.g. `openssl rand -base64 24`) and consider Upstash/Vercel KV for global rate limiting.

### 2. **High: Timing attack on password comparison**

- **Risk:** Login used `submitted !== ADMIN_PASSWORD`. Comparison time can leak information and help brute-force.
- **Fix:** Password comparison in `api/auth/login.js` now uses constant-time comparison (`crypto.timingSafeEqual` with equal-length buffers).

### 3. **Medium: CORS origin reflection**

- **Risk:** In `api/lib/session.js`, `setCorsHeaders` used `process.env.CORS_ORIGIN || req.headers.origin`. If `CORS_ORIGIN` is unset, any origin could be reflected, which is unsafe when using credentials.
- **Fix:** In production (`NODE_ENV=production`), do not fall back to `req.headers.origin`; only set `Access-Control-Allow-Origin` when `CORS_ORIGIN` is set.

### 4. **Medium: XSS in story body**

- **Risk:** `StoryDetail.tsx` rendered `story.body` with `dangerouslySetInnerHTML` (only newlines replaced). If an admin account were compromised or content came from elsewhere, HTML/JS in `body` would execute.
- **Fix:** Story body is no longer rendered as raw HTML. Newlines are preserved by splitting on `\n` and rendering as React nodes (no HTML parsing).

### 5. **Low: Security headers on Vercel**

- **Risk:** Express (local) uses Helmet (HSTS, X-Frame-Options, etc.). Vercel serverless responses did not set these.
- **Fix:** `vercel.json` now adds headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

### 6. **Low: Login body size**

- **Risk:** Login handler did not limit request body size; very large bodies could be used for DoS. Express uses `limit: '1kb'`.
- **Note:** Vercel has default body limits; the in-code body parsing is small. Optional: reject or truncate body before parsing if you want an explicit cap.

---

## Deployment-specific notes

### Vercel (production)

- **Session:** Stateless HMAC-signed cookie only (no server-side session store). Safe as long as `SESSION_SECRET` or `ADMIN_PASSWORD` is strong and not leaked.
- **Rate limiting:** Now applied in the serverless login handler (per-instance). For multi-instance/global limiting, add Upstash Redis or Vercel KV.
- **CORS:** Set `CORS_ORIGIN` in Vercel env to your exact frontend URL (e.g. `https://goldmfroger-stories.vercel.app`) with no trailing slash.

### Local (Express server)

- Rate limiting (5 attempts / 15 min), Helmet, and in-memory sessions are already in place in `server/index.js`.

---

## Checklist for you

- [ ] Use a **strong random** `ADMIN_PASSWORD` (e.g. `openssl rand -base64 24`); never a simple or guessable password.
- [ ] In Vercel: set `ADMIN_PASSWORD`, `CORS_ORIGIN`, `NODE_ENV=production`; optionally `SESSION_SECRET` (different from password).
- [ ] Ensure the site is **HTTPS only** (Vercel does this by default).
- [ ] Keep `.env` out of version control; never commit `ADMIN_PASSWORD` or `SESSION_SECRET`.
- [ ] Consider **Upstash Redis** or **Vercel KV** for login rate limiting across all serverless instances.

---

## Summary

| Severity | Finding | Status |
|----------|---------|--------|
| Critical | No rate limiting on Vercel login | Fixed (in-memory); recommend Upstash/KV for global |
| High | Timing-sensitive password comparison | Fixed (constant-time) |
| Medium | CORS origin reflection when unset | Fixed (no reflection in production) |
| Medium | XSS in story body (`dangerouslySetInnerHTML`) | Fixed (render as text) |
| Low | Missing security headers on Vercel | Fixed (vercel.json headers) |

No backdoors or hardcoded credentials were found. With the applied fixes and the checklist above, the site is in good shape for a small owner-only admin; for higher assurance, add global rate limiting and consider 2FA for the owner account in the future.
