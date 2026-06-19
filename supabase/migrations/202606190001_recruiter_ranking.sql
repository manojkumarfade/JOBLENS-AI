create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  company text,
  description text not null,
  location text,
  experience_min int,
  experience_max int,
  must_have_skills jsonb default '[]'::jsonb,
  nice_to_have_skills jsonb default '[]'::jsonb,
  structured_requirements jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  resume_text text,
  skills jsonb default '[]'::jsonb,
  experience_years numeric,
  current_role text,
  location text,
  education text,
  projects jsonb default '[]'::jsonb,
  career_metadata jsonb default '{}'::jsonb,
  activity_signals jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.candidate_rankings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  overall_score numeric not null,
  semantic_score numeric not null,
  must_have_score numeric not null,
  experience_score numeric not null,
  project_score numeric not null,
  activity_score numeric not null,
  risk_score numeric not null default 0,
  score_breakdown jsonb default '{}'::jsonb,
  matched_signals jsonb default '[]'::jsonb,
  missing_signals jsonb default '[]'::jsonb,
  explanation text,
  interview_questions jsonb default '[]'::jsonb,
  rank_position int not null,
  created_at timestamptz not null default now()
);

create index if not exists jobs_user_created_idx
  on public.jobs (user_id, created_at desc);

create index if not exists candidates_user_created_idx
  on public.candidates (user_id, created_at desc);

create index if not exists candidate_rankings_user_job_rank_idx
  on public.candidate_rankings (user_id, job_id, rank_position);

create index if not exists candidate_rankings_user_created_idx
  on public.candidate_rankings (user_id, created_at desc);

alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_rankings enable row level security;

drop policy if exists "Users manage own jobs" on public.jobs;
create policy "Users manage own jobs"
on public.jobs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own candidates" on public.candidates;
create policy "Users manage own candidates"
on public.candidates
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own candidate rankings" on public.candidate_rankings;
create policy "Users manage own candidate rankings"
on public.candidate_rankings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
