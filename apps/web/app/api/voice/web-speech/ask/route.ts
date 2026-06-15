import { webSpeechAskSchema } from "@joblens/shared";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { callBrainModel, ModelCredentialsError } from "@/lib/ai/modelRouter";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { activeResume, resumeSummary } from "@/lib/data/resumes";
import { globalSystemPrompt } from "@/lib/prompts/templates";
import { sanitizeHeadings, sanitizeJobText } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOB_SUMMARY_SYSTEM = `
You are JobLens, a concise AI career assistant embedded in a browser extension.
The user just clicked you on a job page. In 3-5 sentences, give them:
1. The role and company.
2. The top 3 requirements or responsibilities.
3. One honest flag (gap or concern) if visible.
Speak naturally because this will be read aloud. Do not use markdown.
Do not say "Here is a summary" - start directly with the role.
`;

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to use voice.", 401);
    const body = webSpeechAskSchema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { data: memoryRow } = await supabase
      .from("user_ai_memory")
      .select("memory_text")
      .eq("user_id", user.id)
      .maybeSingle();
    const userMemory = memoryRow?.memory_text?.trim() ?? "";
    const memoryBlock = userMemory ? `\n\n## User memory (context about this user, provided by them)\n${userMemory}` : "";
    const cleanText = sanitizeJobText(body.page.text);
    const resume = await activeResume(user.id, body.resumeId);
    const cleanHeadings = sanitizeHeadings(body.page.headings);

    const { data: pageContext, error: contextError } = await supabase
      .from("page_contexts")
      .insert({
        user_id: user.id,
        source: "extension",
        url: body.page.url,
        title: body.page.title,
        source_type: body.page.sourceType,
        extracted_text: cleanText,
        headings: cleanHeadings,
        extraction_confidence: body.page.confidence ?? null
      })
      .select("id")
      .single();
    if (contextError) throw contextError;

    const hints = [
      body.page.likelyJobTitle ? `Likely job title: ${body.page.likelyJobTitle}` : null,
      body.page.likelyCompany ? `Likely company: ${body.page.likelyCompany}` : null
    ]
      .filter(Boolean)
      .join("\n");

    const isFirstJobTurn = !body.voiceSessionId && body.page.sourceType === "job_page";
    const response = await callBrainModel(user.id, [
      { role: "system", content: `${isFirstJobTurn ? JOB_SUMMARY_SYSTEM : globalSystemPrompt}${memoryBlock}` },
      { role: "user", content: `Job page hints (untrusted):\n${hints || "None"}\n\nHeadings (untrusted):\n${cleanHeadings.join("\n")}\n\nJob page content (untrusted):\n${cleanText}` },
      ...(resume ? [{ role: "user" as const, content: `Resume summary:\n${JSON.stringify(resumeSummary(resume), null, 2)}` }] : []),
      { role: "user", content: isFirstJobTurn ? "Give the initial spoken job-page summary now." : body.question }
    ]);

    let voiceSessionId = body.voiceSessionId ?? null;
    if (!voiceSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("voice_sessions")
        .insert({
          user_id: user.id,
          voice_mode: "web_speech",
          resolved_mode: "web_speech",
          status: "active",
          page_url: body.page.url,
          page_title: body.page.title,
          page_context_id: pageContext.id,
          resume_id: resume?.id ?? body.resumeId ?? null,
          brain_provider: response.modelMeta.provider,
          brain_model: response.modelMeta.model
        })
        .select("id")
        .single();
      if (sessionError) throw sessionError;
      voiceSessionId = session.id;
    }

    const { data: userTranscript } = await supabase
      .from("voice_transcripts")
      .insert({ user_id: user.id, voice_session_id: voiceSessionId, role: "user", text: body.question, source: "web_speech", metadata: { pageContextId: pageContext.id } })
      .select("id")
      .single();

    const { data: transcript } = await supabase
      .from("voice_transcripts")
      .insert({ user_id: user.id, voice_session_id: voiceSessionId, role: "assistant", text: response.answer, source: "web_speech", metadata: { pageContextId: pageContext.id } })
      .select("id")
      .single();

    return json({
      answer: response.answer,
      analysisId: null,
      shouldSpeak: true,
      voiceSessionId,
      userTranscriptId: userTranscript?.id ?? null,
      transcriptId: transcript?.id ?? null,
      modelMeta: response.modelMeta
    });
  } catch (error) {
    if (error instanceof ModelCredentialsError) return errorResponse("MODEL_CREDENTIALS_MISSING", error.message, 400);
    return handleRouteError(error);
  }
}
