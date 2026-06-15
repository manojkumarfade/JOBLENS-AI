-- user_model_credentials: drop Gemini + LiveKit BYOK columns
alter table public.user_model_credentials drop column if exists voice_model;
alter table public.user_model_credentials drop column if exists google_api_key_ciphertext;
alter table public.user_model_credentials drop column if exists google_key_configured;
alter table public.user_model_credentials drop column if exists use_own_livekit;
alter table public.user_model_credentials drop column if exists livekit_url;
alter table public.user_model_credentials drop column if exists livekit_api_key_ciphertext;
alter table public.user_model_credentials drop column if exists livekit_api_secret_ciphertext;
alter table public.user_model_credentials drop column if exists livekit_key_configured;

alter table public.user_model_credentials
  alter column brain_model set default 'openai/gpt-oss-20b';

update public.user_model_credentials
  set brain_model = 'openai/gpt-oss-20b'
  where brain_model in ('gemini-2.5-flash', 'gemini-2.5-pro');

update public.user_model_credentials
  set brain_provider = 'platform'
  where brain_provider = 'gemini';

alter table public.user_model_credentials drop constraint if exists valid_brain_provider;
alter table public.user_model_credentials
  add constraint valid_brain_provider check (brain_provider in ('platform', 'typegpt'));

-- voice_sessions: drop LiveKit/Gemini columns, narrow mode constraints
alter table public.voice_sessions drop column if exists livekit_room_name;
alter table public.voice_sessions drop column if exists voice_model;

update public.voice_sessions set voice_mode = 'web_speech' where voice_mode <> 'web_speech';
update public.voice_sessions set resolved_mode = 'web_speech' where resolved_mode = 'livekit_gemini';

alter table public.voice_sessions drop constraint if exists valid_voice_session_mode;
alter table public.voice_sessions
  add constraint valid_voice_session_mode check (voice_mode in ('web_speech'));

alter table public.voice_sessions drop constraint if exists valid_resolved_mode;
alter table public.voice_sessions
  add constraint valid_resolved_mode check (resolved_mode in ('web_speech', 'text_only'));

-- voice_transcripts: drop the 'livekit' source value
update public.voice_transcripts set source = 'web_speech' where source = 'livekit';

alter table public.voice_transcripts drop constraint if exists valid_transcript_source;
alter table public.voice_transcripts
  add constraint valid_transcript_source check (source in ('web_speech', 'tool', 'text'));

-- user_voice_preferences: default_voice_mode is now always web_speech
update public.user_voice_preferences set default_voice_mode = 'web_speech';
alter table public.user_voice_preferences alter column default_voice_mode set default 'web_speech';
alter table public.user_voice_preferences drop constraint if exists valid_voice_mode;
alter table public.user_voice_preferences
  add constraint valid_voice_mode check (default_voice_mode in ('web_speech'));

alter table public.user_voice_preferences drop column if exists livekit_enabled;
