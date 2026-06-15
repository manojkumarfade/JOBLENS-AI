create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_plan check (plan in ('free', 'pro', 'byok'))
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  original_filename text not null,
  parsed_text text,
  skills jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  experience_level text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_voice_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  default_voice_mode text not null default 'auto',
  language_code text not null default 'en-US',
  web_speech_enabled boolean not null default true,
  livekit_enabled boolean not null default true,
  auto_fallback_enabled boolean not null default true,
  speech_rate numeric not null default 1.0,
  speech_pitch numeric not null default 1.0,
  preferred_browser_voice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_voice_mode check (default_voice_mode in ('auto', 'web_speech', 'livekit_gemini'))
);

create unique index if not exists user_voice_preferences_user_id_idx
on public.user_voice_preferences(user_id);

create table if not exists public.user_model_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brain_provider text not null default 'platform',
  brain_model text not null default 'gemini-2.5-flash',
  voice_model text not null default 'gemini-2.0-flash-live',
  typegpt_api_key_ciphertext text,
  google_api_key_ciphertext text,
  use_own_livekit boolean not null default false,
  livekit_url text,
  livekit_api_key_ciphertext text,
  livekit_api_secret_ciphertext text,
  typegpt_key_configured boolean not null default false,
  google_key_configured boolean not null default false,
  livekit_key_configured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_brain_provider check (brain_provider in ('platform', 'typegpt', 'gemini'))
);

create unique index if not exists user_model_credentials_user_id_idx
on public.user_model_credentials(user_id);

create table if not exists public.page_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'extension',
  url text not null,
  title text,
  source_type text default 'job_page',
  extracted_text text not null,
  headings jsonb default '[]'::jsonb,
  extraction_confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page_context_id uuid references public.page_contexts(id) on delete set null,
  role_title text,
  company_name text,
  summary text,
  match_score integer,
  strong_matches jsonb default '[]'::jsonb,
  missing_skills jsonb default '[]'::jsonb,
  recommended_actions jsonb default '[]'::jsonb,
  apply_recommendation text,
  tailored_bullets jsonb default '[]'::jsonb,
  source text not null default 'web_speech',
  created_at timestamptz not null default now(),
  constraint valid_apply_recommendation check (
    apply_recommendation in ('apply', 'maybe', 'skip') or apply_recommendation is null
  ),
  constraint valid_source check (source in ('web_speech', 'livekit', 'manual'))
);

create table if not exists public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voice_mode text not null,
  resolved_mode text not null,
  status text not null default 'created',
  livekit_room_name text,
  page_url text,
  page_title text,
  page_context_id uuid references public.page_contexts(id) on delete set null,
  resume_id uuid references public.resumes(id) on delete set null,
  brain_provider text,
  brain_model text,
  voice_model text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  error_code text,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  constraint valid_voice_session_mode check (voice_mode in ('auto', 'web_speech', 'livekit_gemini')),
  constraint valid_resolved_mode check (resolved_mode in ('web_speech', 'livekit_gemini', 'text_only')),
  constraint valid_status check (status in ('created', 'active', 'ended', 'failed'))
);

create table if not exists public.voice_transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voice_session_id uuid references public.voice_sessions(id) on delete cascade,
  role text not null,
  text text not null,
  source text not null,
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb,
  constraint valid_transcript_role check (role in ('user', 'assistant', 'system', 'tool')),
  constraint valid_transcript_source check (source in ('web_speech', 'livekit', 'tool', 'text'))
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  razorpay_customer_id text,
  razorpay_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_plan check (plan in ('free', 'pro', 'byok')),
  constraint valid_status check (status in ('active', 'past_due', 'cancelled'))
);

create unique index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists resumes_user_created_idx on public.resumes(user_id, created_at desc);
create index if not exists job_analyses_user_created_idx on public.job_analyses(user_id, created_at desc);
create index if not exists page_contexts_user_created_idx on public.page_contexts(user_id, created_at desc);
create index if not exists voice_sessions_user_started_idx on public.voice_sessions(user_id, started_at desc);
create index if not exists voice_transcripts_session_created_idx on public.voice_transcripts(voice_session_id, created_at);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_voice_preferences_set_updated_at on public.user_voice_preferences;
create trigger user_voice_preferences_set_updated_at
before update on public.user_voice_preferences
for each row execute function public.set_updated_at();

drop trigger if exists user_model_credentials_set_updated_at on public.user_model_credentials;
create trigger user_model_credentials_set_updated_at
before update on public.user_model_credentials
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  insert into public.user_voice_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_model_credentials (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.job_analyses enable row level security;
alter table public.user_voice_preferences enable row level security;
alter table public.user_model_credentials enable row level security;
alter table public.voice_sessions enable row level security;
alter table public.page_contexts enable row level security;
alter table public.voice_transcripts enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users manage own resumes" on public.resumes;
create policy "Users manage own resumes"
on public.resumes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own job analyses" on public.job_analyses;
create policy "Users manage own job analyses"
on public.job_analyses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own voice preferences" on public.user_voice_preferences;
create policy "Users manage own voice preferences"
on public.user_voice_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own model credentials" on public.user_model_credentials;
create policy "Users manage own model credentials"
on public.user_model_credentials
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own voice sessions" on public.voice_sessions;
create policy "Users manage own voice sessions"
on public.voice_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own page contexts" on public.page_contexts;
create policy "Users manage own page contexts"
on public.page_contexts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own voice transcripts" on public.voice_transcripts;
create policy "Users manage own voice transcripts"
on public.voice_transcripts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own subscriptions" on public.subscriptions;
create policy "Users manage own subscriptions"
on public.subscriptions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users access own resume files" on storage.objects;
create policy "Users access own resume files"
on storage.objects
for all
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
