import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { resolveBrainModel, resolveLiveKitStack } from "@/lib/ai/modelRouter";
import { env } from "@/lib/env";
import { resumeSummary } from "@/lib/data/resumes";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  voiceSessionId: z.string().uuid(),
  roomName: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const expected = env("JOBLENS_AGENT_SECRET");
    const header = request.headers.get("authorization");
    if (!expected || header !== `Bearer ${expected}`) {
      return errorResponse("FORBIDDEN", "Invalid agent secret.", 403);
    }
    const body = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { data: session, error: sessionError } = await supabase
      .from("voice_sessions")
      .select("*")
      .eq("id", body.voiceSessionId)
      .eq("livekit_room_name", body.roomName)
      .single();
    if (sessionError) throw sessionError;
    const [{ data: page }, { data: resume }] = await Promise.all([
      supabase.from("page_contexts").select("*").eq("id", session.page_context_id).single(),
      session.resume_id
        ? supabase.from("resumes").select("*").eq("id", session.resume_id).single()
        : supabase.from("resumes").select("*").eq("user_id", session.user_id).eq("is_active", true).maybeSingle()
    ]);
    const brain = await resolveBrainModel(session.user_id);
    const livekit = await resolveLiveKitStack(session.user_id);
    if (!livekit.googleApiKey) return errorResponse("MODEL_CREDENTIALS_MISSING", "No Gemini key is available for the voice layer.", 400);

    return json({
      userId: session.user_id,
      pageContext: {
        url: page?.url ?? "",
        title: page?.title ?? "",
        text: page?.extracted_text ?? "",
        headings: page?.headings ?? []
      },
      resumeSummary: resumeSummary(resume),
      brainProvider: brain.provider,
      brainModel: brain.model,
      brainApiKey: brain.apiKey,
      voiceModel: livekit.voiceModel,
      googleApiKey: livekit.googleApiKey
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
