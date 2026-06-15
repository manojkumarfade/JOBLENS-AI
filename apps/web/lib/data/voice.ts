import type { VoicePreferences } from "@joblens/shared";
import { boolEnv, env } from "../env";
import { createSupabaseServiceClient } from "../supabase/server";

type VoicePreferenceRow = {
  default_voice_mode: "web_speech";
  language_code: string;
  web_speech_enabled: boolean;
  auto_fallback_enabled: boolean;
  speech_rate: number;
  speech_pitch: number;
  preferred_browser_voice: string | null;
};

export async function ensureVoicePreferences(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_voice_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as VoicePreferenceRow;

  const { data: inserted, error: insertError } = await supabase
    .from("user_voice_preferences")
    .insert({
      user_id: userId,
      default_voice_mode: env("DEFAULT_VOICE_MODE", "web_speech")
    })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return inserted as VoicePreferenceRow;
}

export async function mapVoicePreferences(_userId: string, row: VoicePreferenceRow): Promise<VoicePreferences> {
  return {
    defaultVoiceMode: "web_speech",
    languageCode: row.language_code,
    webSpeechEnabled: row.web_speech_enabled && boolEnv("ALLOW_WEB_SPEECH", true),
    autoFallbackEnabled: row.auto_fallback_enabled,
    speechRate: Number(row.speech_rate),
    speechPitch: Number(row.speech_pitch),
    preferredBrowserVoice: row.preferred_browser_voice
  };
}
