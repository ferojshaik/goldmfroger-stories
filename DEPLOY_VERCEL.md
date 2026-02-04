# Deploy to Vercel — Step-by-step

This guide walks you through publishing **GoldRoger Stories** on Vercel. The site (Vite + React) and the owner-login API run on Vercel together.

---

## Before you start

- [ ] Code is in a **Git** repo (e.g. on **GitHub**).
- [ ] You have a **Vercel** account: [vercel.com](https://vercel.com) → Sign up / Log in.
- [ ] You have a **strong owner password** (e.g. generate with: `openssl rand -base64 24`). **Do not** use a simple password like `GoldMFroger2024`.

---

## Step 1 — Push your code to GitHub

1. In your project folder, make sure Git is initialized and your code is committed:
   ```bash
   git status
   ```
2. If you don’t have a remote yet, create a repo on GitHub, then:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   (Use your branch name if it’s not `main`.)

**Important:** Do **not** commit your `.env` file. It should be in `.gitignore`. You’ll add secrets in Vercel instead.

---

## Step 2 — Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repo (e.g. `goldmfroger-stories`).
4. Vercel will detect the project. Leave the defaults for now:
   - **Framework Preset:** Vite (or “Other” if it doesn’t say Vite).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. **Do not** click Deploy yet. Go to **Environment Variables** first.

---

## Step 3 — Set environment variables in Vercel

1. In the same “Import Project” screen, open the **Environment Variables** section.
2. Add these variables (one by one). Use **Production** (and optionally Preview if you want):

   | Name             | Value                                      | Notes                                      |
   |------------------|--------------------------------------------|--------------------------------------------|
   | `ADMIN_PASSWORD`  | Your strong owner password                 | Same one you’d use in `.env` locally.      |
   | `SESSION_SECRET`  | A long random string (e.g. 32+ chars)     | Optional; if missing, `ADMIN_PASSWORD` is used to sign cookies. |
   | `CORS_ORIGIN`     | Your Vercel site URL                      | e.g. `https://goldmfroger-stories.vercel.app` — **no trailing slash**. You can set this after the first deploy (see Step 5). |
   | `NODE_ENV`        | `production`                               | So the session cookie is sent as `Secure`. |

3. **Generate a strong password** if you haven’t:
   - Windows (PowerShell): `[Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])`
   - Mac/Linux: `openssl rand -base64 24`
4. Click **Deploy** and wait for the build to finish.

---

## Step 4 — Get your live URL

1. After the deploy finishes, Vercel shows a URL like:
   - `https://goldmfroger-stories-xxxx.vercel.app`
   or your custom domain if you added one.
2. Open that URL in your browser. You should see your site.
3. Test owner login: go to  
   `https://YOUR_VERCEL_URL/#/owner`  
   and log in with `ADMIN_PASSWORD`.

---

## Step 5 — Set CORS_ORIGIN (recommended)

1. In Vercel: **Project** → **Settings** → **Environment Variables**.
2. Add or edit:
   - **Name:** `CORS_ORIGIN`
   - **Value:** Your exact site URL, e.g. `https://goldmfroger-stories.vercel.app` (no trailing slash).
3. **Redeploy** (Deployments → … on latest → Redeploy) so the API uses the new value.

---

## Step 6 — Optional: custom domain

1. In Vercel: **Project** → **Settings** → **Domains**.
2. Add your domain and follow the DNS instructions.
3. After the domain is active, set **CORS_ORIGIN** to that URL (e.g. `https://yoursite.com`) and redeploy.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| Build fails | Check the build log. Ensure `npm run build` works locally and all dependencies are in `package.json`. |
| “Invalid password” at `/api/auth/login` | Confirm `ADMIN_PASSWORD` in Vercel matches what you type. No extra spaces; use Production env. |
| Login works but then “not logged in” | Set `CORS_ORIGIN` to your exact Vercel URL (no trailing slash) and `NODE_ENV=production`, then redeploy. |
| 404 on refresh or direct URL | The app uses client-side routing. `vercel.json` rewrites non-API routes to `index.html`; if you changed it, restore that rewrite. |

---

## Summary

- **Repo** → Push to GitHub (no `.env` in the repo).
- **Vercel** → Import project, add `ADMIN_PASSWORD`, `CORS_ORIGIN`, `NODE_ENV=production` (and optionally `SESSION_SECRET`), then deploy.
- **Owner login** → Use `https://YOUR_SITE/#/owner` with your strong password.

If you want, we can go through a specific step (e.g. “Step 2” or “setting env vars”) in more detail.
