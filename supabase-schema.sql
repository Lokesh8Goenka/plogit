-- plogit schema — paste into Supabase → SQL Editor → Run.
-- One table: walks, owned by the signed-in user, with Row-Level Security so
-- each person sees only their own hauls. original_lines captures what the model
-- first said (before the user's corrections) as the accuracy feedback signal.

create table if not exists public.walks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  total_weight_g  numeric not null,
  lines           jsonb not null,            -- final (corrected) items
  original_lines  jsonb,                     -- what the model first returned
  edited          boolean not null default false,
  image_hash      text not null,             -- perceptual dHash, for dedup
  thumbnail       text                       -- small data URL
);

-- Fast lookups of a user's walks and their hashes (duplicate check).
create index if not exists walks_user_created_idx on public.walks (user_id, created_at desc);
create index if not exists walks_user_hash_idx on public.walks (user_id, image_hash);

-- Row-Level Security: a user can only read/write their own rows.
alter table public.walks enable row level security;

create policy "own walks - select" on public.walks
  for select using (auth.uid() = user_id);

create policy "own walks - insert" on public.walks
  for insert with check (auth.uid() = user_id);

create policy "own walks - delete" on public.walks
  for delete using (auth.uid() = user_id);
