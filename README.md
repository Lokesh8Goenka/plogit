# plogit 🌱

Turn your clean-up into something worth sharing. Photograph the waste you picked
up on a walk → it identifies the items → estimates the total weight → logs your
growing impact.

> Weight is an **approximate** estimate derived from recognised packaging, not a
> measurement. Users can correct the item list, which both fixes the total and
> feeds future accuracy.

## Architecture

```
frontend (Vite + React + TS)
  ├─ Supabase  → auth (Google) + walks database (per-account, cross-device)
  └─ /api      → backend proxy → Gemini (keeps the model key server-side)

backend (Express + TS)
  └─ VisionProvider seam → GeminiProvider (swap-in later: self-hosted Qwen-VL)
     + litter dictionary (empty-packaging weights) + two-tier weight estimate
```

## Local development

### Backend (`/backend`)
```bash
cd backend
npm install
cp .env.example .env     # add GEMINI_API_KEY (from aistudio.google.com)
npm run start            # http://localhost:3001
```
Without `GEMINI_API_KEY` it runs a mock provider, so the pipeline works offline.

### Frontend (`/frontend`)
```bash
cd frontend
npm install
cp .env.example .env     # add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev              # http://localhost:5173  (proxies /api to :3001)
```
Without the Supabase keys it runs in **guest mode** (localStorage, no login).

## Database
Run [`supabase-schema.sql`](./supabase-schema.sql) in Supabase → SQL Editor.
Row-Level Security ensures each user only sees their own walks.

## Deployment (GitHub → Supabase → Vercel)

The repo deploys as a single Vercel project: the frontend is built to static
files, and `/api/estimate` + `/api/catalog` run as **serverless functions**
(they reuse `backend/src` — one source of logic). `vercel.json` configures this.

### Vercel steps
1. Vercel → **Add New Project** → import `Lokesh8Goenka/plogit`
2. **Root Directory**: leave as repo root (where `vercel.json` lives)
3. **Environment Variables** (Project Settings → Environment Variables):
   | Var | Value | Notes |
   |-----|-------|-------|
   | `GEMINI_API_KEY` | your AI Studio key | **server-side only** |
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | build-time |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` | build-time, public |
4. **Deploy**. Note the production URL (e.g. `https://plogit.vercel.app`).

### After the first deploy — point auth at the live URL
- **Supabase** → Authentication → URL Configuration → add the Vercel URL to
  **Redirect URLs** (keep `http://localhost:5173` too).
- **Google Cloud** → Credentials → your OAuth client → add the Vercel URL to
  **Authorized JavaScript origins**.
- Redeploy if you changed any `VITE_*` var.

> Images are downscaled client-side before upload, keeping requests under
> Vercel's ~4.5MB function body limit.

## Env vars summary
| Var | Where | Secret? |
|-----|-------|---------|
| `GEMINI_API_KEY` | backend / Vercel (server) | **yes** |
| `VITE_SUPABASE_URL` | frontend | no (public) |
| `VITE_SUPABASE_ANON_KEY` | frontend | no (public, RLS-protected) |
