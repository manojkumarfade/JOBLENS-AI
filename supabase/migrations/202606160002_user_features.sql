-- 1. Add username and display_name to profiles
alter table public.profiles
  add column if not exists username text unique,
  add column if not exists display_name text;

alter table public.profiles
  add constraint username_format check (
    username is null or (
      length(username) >= 3 and
      length(username) <= 30 and
      username ~ '^[a-z0-9_-]+$'
    )
  );

-- 2. AI memory table
create table if not exists public.user_ai_memory (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  memory_text   text not null default '',
  updated_at    timestamptz not null default now()
);

alter table public.user_ai_memory enable row level security;

create policy "owner_all" on public.user_ai_memory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create unique index if not exists user_ai_memory_user_id_idx
  on public.user_ai_memory (user_id);

-- Ensure updated_at auto-bumps (reuse existing trigger function)
create trigger user_ai_memory_updated_at
  before update on public.user_ai_memory
  for each row execute function public.set_updated_at();

-- 3. Subscription management link column (optional deep-link for Razorpay portal)
alter table public.subscriptions
  add column if not exists portal_url text;
