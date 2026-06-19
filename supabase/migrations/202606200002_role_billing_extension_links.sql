alter table public.subscriptions
  add column if not exists portal_url text;

alter table public.profiles
  add column if not exists candidate_tutorial_seen_at timestamptz,
  add column if not exists recruiter_tutorial_seen_at timestamptz;

create table if not exists public.user_extension_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  extension_id text not null,
  label text,
  is_active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint user_extension_links_extension_id_format check (extension_id ~ '^[a-p]{32}$')
);

create unique index if not exists user_extension_links_user_extension_idx
  on public.user_extension_links(user_id, extension_id);

create index if not exists user_extension_links_user_active_idx
  on public.user_extension_links(user_id, is_active)
  where revoked_at is null;

alter table public.user_extension_links enable row level security;

drop policy if exists "Users manage own extension links" on public.user_extension_links;
create policy "Users manage own extension links"
on public.user_extension_links
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
