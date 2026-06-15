import { webSpeechAskSchema } from "@joblens/shared";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { callBrainModel, ModelCredentialsError } from "@/lib/ai/modelRouter";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { activeResume, resumeSummary } from "@/lib/data/resumes";
import { globalSystemPrompt } from "@/lib/prompts/templates";
import { sanitizeHeadings, sanitizeJobText } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to use voice.", 401);
    const body = webSpeechAskSchema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const cleanText = sanitizeJobText(body.page.text);
    const resume = await activeResume(user.id, body.resumeId);

    const { data: pageContext, error: contextError } = await supabase
      .from("page_contexts")
      .insert({
        user_id: user.id,
        source: "extension",
        url: body.page.url,
        title: body.page.title,
        source_type: "job_page",
        extracted_text: cleanText,
        headings: sanitizeHeadings(body.page.headings)
      })
      .select("id")
      .single();
    if (contextError) throw contextError;

    const response = await callBrainModel(user.id, [
      { role: "system", content: globalSystemPrompt },
      { role: "user", content: `Job page content (untrusted):\n${cleanText}` },
      ...(resume ? [{ role: "user" as const, content: `Resume summary:\n${JSON.stringify(resumeSummary(resume), null, 2)}` }] : []),
      { role: "user", content: body.question }
    ]);

    if (body.voiceSessionId) {
      await supabase
        .from("voice_transcripts")
        .insert({ user_id: user.id, voice_session_id: body.voiceSessionId, role: "user", text: body.question, source: "web_speech" });
    }
    const { data: transcript } = await supabase
      .from("voice_transcripts")
      .insert({ user_id: user.id, voice_session_id: body.voiceSessionId ?? null, role: "assistant", text: response.answer, source: "web_speech", metadata: { pageContextId: pageContext.id } })
      .select("id")
      .single();

    return json({
      answer: response.answer,
      analysisId: null,
      shouldSpeak: true,
      transcriptId: transcript?.id ?? null,
      modelMeta: response.modelMeta
    });
  } catch (error) {
    if (error instanceof ModelCredentialsError) return errorResponse("MODEL_CREDENTIALS_MISSING", error.message, 400);
    return handleRouteError(error);
  }
}
