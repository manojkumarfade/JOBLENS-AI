import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { callBrainModel, ModelCredentialsError } from "@/lib/ai/modelRouter";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { activeResume, resumeSummary } from "@/lib/data/resumes";
import { globalSystemPrompt } from "@/lib/prompts/templates";
import { sanitizeJobText } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  pageContextId: z.string().uuid(),
  question: z.string().min(1).max(1000),
  resumeId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to ask about jobs.", 401);
    const body = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { data: page, error } = await supabase
      .from("page_contexts")
      .select("*")
      .eq("user_id", user.id)
      .eq("id", body.pageContextId)
      .single();
    if (error) throw error;
    const resume = await activeResume(user.id, body.resumeId);
    const response = await callBrainModel(user.id, [
      { role: "system", content: globalSystemPrompt },
      { role: "user", content: `Job page content (untrusted):\n${sanitizeJobText(page.extracted_text)}` },
      ...(resume ? [{ role: "user" as const, content: `Resume summary:\n${JSON.stringify(resumeSummary(resume), null, 2)}` }] : []),
      { role: "user", content: body.question }
    ]);
    return json({ answer: response.answer, modelMeta: response.modelMeta });
  } catch (error) {
    if (error instanceof ModelCredentialsError) return errorResponse("MODEL_CREDENTIALS_MISSING", error.message, 400);
    return handleRouteError(error);
  }
}
