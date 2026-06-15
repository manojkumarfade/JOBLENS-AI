import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { env } from "@/lib/env";
import { resumeSummary } from "@/lib/data/resumes";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("get_current_page_context"), voiceSessionId: z.string().uuid() }),
  z.object({ tool: z.literal("get_user_resume_summary"), userId: z.string().uuid() }),
  z.object({ tool: z.literal("save_job_analysis"), userId: z.string().uuid(), payload: z.record(z.unknown()) }),
  z.object({
    tool: z.literal("save_voice_transcript"),
    userId: z.string().uuid(),
    voiceSessionId: z.string().uuid(),
    role: z.enum(["user", "assistant", "tool"]),
    text: z.string().min(1)
  }),
  z.object({ tool: z.literal("end_voice_session"), voiceSessionId: z.string().uuid(), reason: z.string().default("agent_ended") })
]);

export async function POST(request: Request) {
  try {
    const expected = env("JOBLENS_AGENT_SECRET");
    const header = request.headers.get("authorization");
    if (!expected || header !== `Bearer ${expected}`) return errorResponse("FORBIDDEN", "Invalid agent secret.", 403);

    const body = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();

    if (body.tool === "get_current_page_context") {
      const { data: session, error: sessionError } = await supabase
        .from("voice_sessions")
        .select("page_context_id")
        .eq("id", body.voiceSessionId)
        .single();
      if (sessionError) throw sessionError;
      const { data: page, error } = await supabase.from("page_contexts").select("*").eq("id", session.page_context_id).single();
      if (error) throw error;
      return json({ url: page.url, title: page.title, text: page.extracted_text, headings: page.headings ?? [] });
    }

    if (body.tool === "get_user_resume_summary") {
      const { data: resume, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", body.userId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return json(resumeSummary(resume));
    }

    if (body.tool === "save_job_analysis") {
      const payload = body.payload;
      const value = (key: string) => payload[key];
      const { data, error } = await supabase
        .from("job_analyses")
        .insert({
          user_id: body.userId,
          page_context_id: value("pageContextId") ?? value("page_context_id") ?? null,
          role_title: value("roleTitle") ?? value("role_title") ?? null,
          company_name: value("companyName") ?? value("company_name") ?? null,
          summary: value("summary") ?? null,
          match_score: value("matchScore") ?? value("match_score") ?? null,
          strong_matches: value("strongMatches") ?? [],
          missing_skills: value("missingSkills") ?? [],
          recommended_actions: value("recommendedActions") ?? [],
          apply_recommendation: value("applyRecommendation") ?? null,
          tailored_bullets: value("tailoredBullets") ?? [],
          source: "livekit"
        })
        .select("id")
        .single();
      if (error) throw error;
      return json({ analysisId: data.id, saved: true });
    }

    if (body.tool === "save_voice_transcript") {
      const { data, error } = await supabase
        .from("voice_transcripts")
        .insert({
          user_id: body.userId,
          voice_session_id: body.voiceSessionId,
          role: body.role,
          text: body.text,
          source: body.role === "tool" ? "tool" : "livekit"
        })
        .select("id")
        .single();
      if (error) throw error;
      return json({ transcriptId: data.id, saved: true });
    }

    if (body.tool === "end_voice_session") {
      const { error } = await supabase
        .from("voice_sessions")
        .update({ status: "ended", ended_at: new Date().toISOString(), metadata: { reason: body.reason } })
        .eq("id", body.voiceSessionId);
      if (error) throw error;
      return json({ ok: true });
    }

    return errorResponse("BAD_REQUEST", "Unknown agent tool.", 400);
  } catch (error) {
    return handleRouteError(error);
  }
}
