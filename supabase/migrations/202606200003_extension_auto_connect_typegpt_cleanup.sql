-- Keep older databases aligned with the Browser Copilot extension flow and TypeGPT-only model catalog.
alter table public.user_model_credentials
  alter column brain_model set default 'openai/gpt-oss-20b';

update public.user_model_credentials
set brain_model = 'openai/gpt-oss-20b'
where brain_model is null
  or brain_model in ('gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-live');

update public.user_model_credentials
set brain_provider = 'platform'
where brain_provider is null
  or brain_provider not in ('platform', 'typegpt');

alter table public.user_model_credentials drop constraint if exists valid_brain_provider;
alter table public.user_model_credentials
  add constraint valid_brain_provider check (brain_provider in ('platform', 'typegpt'));
