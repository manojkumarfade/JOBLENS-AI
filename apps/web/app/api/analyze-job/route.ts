import { jobSummarySchema, pageContextSchema, resumeComparisonSchema } from "@joblens/shared";
import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { callBrainModel, ModelCredentialsError } from "@/lib/ai/modelRouter";
import { parseModelJson } from "@/lib/ai/json";
import { requireApiRole } from "@/lib/auth/roles";
import { activeResume, resumeSummary } from "@/lib/data/resumes";
import { jobAnalysisPrompt, globalSystemPrompt, resumeComparisonPrompt } from "@/lib/prompts/templates";
import { sanitizeHeadings, sanitizeJobText } from "@/lib/security/sanitize";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  page: pageContextSchema.pick({ url: true, title: true, text: true }).extend({
    headings: z.array(z.string()).default([])
  }),
  resumeId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const user = auth.user;
    const supabase = createSupabaseServiceClient();
    const { data: memoryRow } = await supabase
      .from("user_ai_memory")
      .select("memory_text")
      .eq("user_id", user.id)
      .maybeSingle();
    const userMemory = memoryRow?.memory_text?.trim() ?? "";
    const memoryBlock = userMemory ? `\n\n## User memory (context about this user, provided by them)\n${userMemory}` : "";
    const body = schema.parse(await readJson(request));
    const page = {
      ...body.page,
      text: sanitizeJobText(body.page.text),
      headings: sanitizeHeadings(body.page.headings)
    };

    const summaryCall = await callBrainModel(user.id, [
      { role: "system", content: `${globalSystemPrompt}${memoryBlock}` },
      { role: "user", content: jobAnalysisPrompt(page) }
    ]);
    const summary = await parseModelJson(summaryCall.answer, jobSummarySchema, async () => {
      return (
        await callBrainModel(user.id, [
          { role: "system", content: `${globalSystemPrompt}${memoryBlock}` },
          { role: "user", content: `${jobAnalysisPrompt(page)}\n\nReturn valid JSON only.` }
        ])
      ).answer;
    });

    const resume = await activeResume(user.id, body.resumeId);
    let comparison = null;
    if (resume) {
      const compareCall = await callBrainModel(user.id, [
        { role: "system", content: `${globalSystemPrompt}${memoryBlock}` },
        { role: "user", content: resumeComparisonPrompt({ jobSummaryJson: summary, resumeSummaryJson: resumeSummary(resume) }) }
      ]);
      comparison = await parseModelJson(compareCall.answer, resumeComparisonSchema);
    }

    return json({
      roleTitle: summary.roleTitle,
      companyName: summary.companyName,
      summary: summary.summary,
      responsibilities: summary.responsibilities,
      requirements: summary.requirements,
      salaryOrLocation: summary.salaryOrLocation,
      matchScore: comparison?.matchScore ?? null,
      strongMatches: comparison?.strongMatches ?? [],
      missingSkills: comparison?.missingSkills ?? [],
      recommendedActions: comparison?.recommendedActions ?? [],
      applyRecommendation: comparison?.applyRecommendation ?? null,
      modelMeta: summaryCall.modelMeta
    });
  } catch (error) {
    if (error instanceof ModelCredentialsError) return errorResponse("MODEL_CREDENTIALS_MISSING", error.message, 400);
    return handleRouteError(error);
  }
}
