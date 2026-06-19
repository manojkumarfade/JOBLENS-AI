import { resumeTailoringSchema } from "@joblens/shared";
import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { callBrainModel, ModelCredentialsError } from "@/lib/ai/modelRouter";
import { parseModelJson } from "@/lib/ai/json";
import { requireApiRole } from "@/lib/auth/roles";
import { globalSystemPrompt, resumeTailoringPrompt } from "@/lib/prompts/templates";
import { sanitizeJobText } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  resumeId: z.string().uuid(),
  pageContextId: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const user = auth.user;
    const body = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const [{ data: resume, error: resumeError }, { data: page, error: pageError }, { data: memoryRow }] = await Promise.all([
      supabase.from("resumes").select("*").eq("user_id", user.id).eq("id", body.resumeId).single(),
      supabase.from("page_contexts").select("*").eq("user_id", user.id).eq("id", body.pageContextId).single(),
      supabase.from("user_ai_memory").select("memory_text").eq("user_id", user.id).maybeSingle()
    ]);
    if (resumeError) throw resumeError;
    if (pageError) throw pageError;

    const resumeBullets = String(resume.parsed_text ?? "")
      .split(/\n|•|-/)
      .map((line) => line.trim())
      .filter((line) => line.length > 20)
      .slice(0, 30);
    const jobRequirements = sanitizeJobText(page.extracted_text)
      .split(/[.;]/)
      .map((line) => line.trim())
      .filter((line) => /required|experience|skill|responsib|must|preferred/i.test(line))
      .slice(0, 30);

    const userMemory = memoryRow?.memory_text?.trim() ?? "";
    const memoryBlock = userMemory ? `\n\n## User memory (context about this user, provided by them)\n${userMemory}` : "";

    const result = await callBrainModel(user.id, [
      { role: "system", content: `${globalSystemPrompt}${memoryBlock}` },
      { role: "user", content: resumeTailoringPrompt({ resumeBullets, jobRequirements }) }
    ]);
    const parsed = await parseModelJson(result.answer, resumeTailoringSchema);
    return json(parsed);
  } catch (error) {
    if (error instanceof ModelCredentialsError) return errorResponse("MODEL_CREDENTIALS_MISSING", error.message, 400);
    return handleRouteError(error);
  }
}
