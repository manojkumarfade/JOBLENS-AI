import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  voiceSessionId: z.string().uuid(),
  reason: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to end voice sessions.", 401);
    const body = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("voice_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString(), metadata: { reason: body.reason ?? "user_ended" } })
      .eq("user_id", user.id)
      .eq("id", body.voiceSessionId);
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
