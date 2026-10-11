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

## Deployment pipeline (GitHub → Supabase → Vercel)
- **Supabase**: hosts auth + Postgres. Add `localhost:5173` and the Vercel URL to
  Auth → URL Configuration. Enable the Google provider.
- **Vercel**: deploys the frontend. Set env vars `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY` (server-side).
- The Express backend becomes a Vercel serverless function (see deploy notes).

## Env vars summary
| Var | Where | Secret? |
|-----|-------|---------|
| `GEMINI_API_KEY` | backend / Vercel (server) | **yes** |
| `VITE_SUPABASE_URL` | frontend | no (public) |
| `VITE_SUPABASE_ANON_KEY` | frontend | no (public, RLS-protected) |
