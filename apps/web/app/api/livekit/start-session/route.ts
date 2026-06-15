import { pageContextSchema } from "@joblens/shared";
import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { resolveBrainModel, resolveLiveKitStack } from "@/lib/ai/modelRouter";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { liveKitRoomName } from "@/lib/livekit/session";
import { mintLiveKitToken } from "@/lib/livekit/token";
import { sanitizeHeadings, sanitizeJobText } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  preferredVoiceMode: z.enum(["auto", "web_speech", "livekit_gemini"]),
  page: pageContextSchema,
  resumeId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to start voice sessions.", 401);
    const body = schema.parse(await readJson(request));
    const stack = await resolveLiveKitStack(user.id);
    if (!stack.available) {
      return errorResponse("VOICE_MODE_UNAVAILABLE", "Natural Call Voice is unavailable. You can continue with Fast & Free Voice.", 400, "web_speech");
    }
    const brain = await resolveBrainModel(user.id);
    const supabase = createSupabaseServiceClient();
    const { data: pageContext, error: pageError } = await supabase
      .from("page_contexts")
      .insert({
        user_id: user.id,
        source: "extension",
        url: body.page.url,
        title: body.page.title,
        source_type: body.page.sourceType ?? "job_page",
        extracted_text: sanitizeJobText(body.page.text),
        headings: sanitizeHeadings(body.page.headings),
        extraction_confidence: body.page.confidence ?? null
      })
      .select("id")
      .single();
    if (pageError) throw pageError;
    const { data: session, error: sessionError } = await supabase
      .from("voice_sessions")
      .insert({
        user_id: user.id,
        voice_mode: body.preferredVoiceMode,
        resolved_mode: "livekit_gemini",
        status: "active",
        page_url: body.page.url,
        page_title: body.page.title,
        page_context_id: pageContext.id,
        resume_id: body.resumeId ?? null,
        brain_provider: brain.provider,
        brain_model: brain.model,
        voice_model: stack.voiceModel
      })
      .select("id")
      .single();
    if (sessionError) throw sessionError;
    const roomName = liveKitRoomName(user.id, session.id);
    await supabase.from("voice_sessions").update({ livekit_room_name: roomName }).eq("id", session.id);
    const token = await mintLiveKitToken({
      apiKey: stack.livekitApiKey,
      apiSecret: stack.livekitApiSecret,
      roomName,
      identity: user.id
    });

    return json({
      resolvedMode: "livekit_gemini",
      voiceSessionId: session.id,
      roomName,
      token,
      livekitUrl: stack.livekitUrl,
      pageContextId: pageContext.id,
      voiceModel: stack.voiceModel,
      brainModel: brain.model
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
