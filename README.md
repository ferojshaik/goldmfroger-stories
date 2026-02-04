
# GoldRoger Stories - Satirical Storytelling Platform

A Next.js production-ready site for @GoldRoger YouTube channel.

## 🚀 How to Add New Stories

1. Create a new `.mdx` file in `content/stories/`.
2. Add frontmatter at the top of the file:
```md
---
title: "The Absurd Tale of X"
slug: "absurd-tale-x"
date: "2024-07-01"
description: "A short snippet of the roast."
image: "/images/story-thumb.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=..."
category: "Street Justice"
images:
  - "/images/gallery1.jpg"
  - "/images/gallery2.jpg"
---
```
3. Write your story below using standard Markdown or custom MDX components.
4. Push to GitHub, and Vercel will automatically rebuild the static site.

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Content**: MDX via Contentlayer
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Fonts**: Montserrat & Inter

## 📦 Local Setup

1. Clone the repo.
2. Run `npm install`.
3. Run `npm run dev` for the frontend.
4. **Owner login (Creator Studio):** Run `npm run server` in a separate terminal so the auth server runs on port 3002. In the project root, create a `.env` file with `ADMIN_PASSWORD=your-strong-random-password` (see `.env.example`). There is **no visible link** on the site—only you go to **`yoursite.com/#/owner`** (or `http://localhost:5173/#/owner` locally), enter the password, and you’ll get access to Creator Studio. Visitors never see a login link.

## ☁️ Deployment (Vercel)

**Step-by-step:** See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** for full instructions to publish on Vercel. In short:

1. Push your code to GitHub (do **not** commit `.env`).
2. In [Vercel](https://vercel.com), import the repo and add environment variables: `ADMIN_PASSWORD`, `CORS_ORIGIN` (your Vercel site URL), `NODE_ENV=production`.
3. Deploy. Owner login is at `https://YOUR_SITE/#/owner`.

**Production (other hosts):** Set a **strong, unique** `ADMIN_PASSWORD`, serve over **HTTPS**, and set `CORS_ORIGIN` to your frontend URL and `NODE_ENV=production`. See `SECURITY.md` for the full checklist.
