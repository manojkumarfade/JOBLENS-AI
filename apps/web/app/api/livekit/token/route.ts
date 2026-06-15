import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { resolveLiveKitStack } from "@/lib/ai/modelRouter";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { mintLiveKitToken } from "@/lib/livekit/token";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({ voiceSessionId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to mint LiveKit tokens.", 401);
    const body = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { data: session, error } = await supabase
      .from("voice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", body.voiceSessionId)
      .single();
    if (error) throw error;
    const stack = await resolveLiveKitStack(user.id);
    if (!stack.available || !session.livekit_room_name) return errorResponse("VOICE_MODE_UNAVAILABLE", "LiveKit is unavailable.", 400, "web_speech");
    const token = await mintLiveKitToken({
      apiKey: stack.livekitApiKey,
      apiSecret: stack.livekitApiSecret,
      roomName: session.livekit_room_name,
      identity: user.id
    });
    return json({ token, livekitUrl: stack.livekitUrl });
  } catch (error) {
    return handleRouteError(error);
  }
}
