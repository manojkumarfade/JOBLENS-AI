import { z } from "zod";
import { handleRouteError, json, readJson } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  analysis: z.record(z.unknown())
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const user = auth.user;
    const { analysis } = schema.parse(await readJson(request));
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("job_analyses")
      .insert({
        user_id: user.id,
        page_context_id: analysis.pageContextId ?? analysis.page_context_id ?? null,
        role_title: analysis.roleTitle ?? analysis.role_title ?? null,
        company_name: analysis.companyName ?? analysis.company_name ?? null,
        summary: analysis.summary ?? null,
        match_score: analysis.matchScore ?? analysis.match_score ?? null,
        strong_matches: analysis.strongMatches ?? analysis.strong_matches ?? [],
        missing_skills: analysis.missingSkills ?? analysis.missing_skills ?? [],
        recommended_actions: analysis.recommendedActions ?? analysis.recommended_actions ?? [],
        apply_recommendation: analysis.applyRecommendation ?? analysis.apply_recommendation ?? null,
        tailored_bullets: analysis.tailoredBullets ?? analysis.tailored_bullets ?? [],
        source: analysis.source ?? "manual"
      })
      .select("id")
      .single();
    if (error) throw error;
    return json({ analysisId: data.id, saved: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
