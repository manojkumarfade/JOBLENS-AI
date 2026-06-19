alter table public.profiles
  add column if not exists display_name text,
  add column if not exists username text,
  add column if not exists user_role text not null default 'candidate';

update public.profiles
set user_role = 'candidate'
where user_role is null;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (username)
  where username is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_username_format'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_username_format check (
        username is null or (
          length(username) >= 3 and
          length(username) <= 30 and
          username ~ '^[a-z0-9_-]+$'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_user_role_valid'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_user_role_valid check (user_role in ('candidate', 'recruiter'));
  end if;
end $$;
