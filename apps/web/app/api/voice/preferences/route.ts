import { voicePreferencesPatchSchema } from "@joblens/shared";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { ensureVoicePreferences, mapVoicePreferences } from "@/lib/data/voice";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to manage voice preferences.", 401);
    const row = await ensureVoicePreferences(user.id);
    return json(await mapVoicePreferences(user.id, row));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to manage voice preferences.", 401);
    const body = voicePreferencesPatchSchema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("user_voice_preferences")
      .upsert(
        {
          user_id: user.id,
          default_voice_mode: body.defaultVoiceMode,
          language_code: body.languageCode,
          auto_fallback_enabled: body.autoFallbackEnabled,
          speech_rate: body.speechRate,
          speech_pitch: body.speechPitch,
          preferred_browser_voice: body.preferredBrowserVoice
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();
    if (error) throw error;
    return json({ ok: true, preferences: await mapVoicePreferences(user.id, data) });
  } catch (error) {
    return handleRouteError(error);
  }
}
