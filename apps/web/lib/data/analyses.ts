import { createSupabaseServiceClient } from "../supabase/server";

type AnalysisRow = Record<string, unknown>;

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export function mapAnalysis(row: AnalysisRow) {
  return {
    id: String(row.id ?? ""),
    roleTitle: typeof row.role_title === "string" ? row.role_title : null,
    companyName: typeof row.company_name === "string" ? row.company_name : null,
    summary: typeof row.summary === "string" ? row.summary : null,
    matchScore: typeof row.match_score === "number" ? row.match_score : null,
    strongMatches: stringArray(row.strong_matches),
    missingSkills: stringArray(row.missing_skills),
    recommendedActions: stringArray(row.recommended_actions),
    applyRecommendation: typeof row.apply_recommendation === "string" ? row.apply_recommendation : null,
    tailoredBullets: stringArray(row.tailored_bullets),
    source: typeof row.source === "string" ? row.source : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    pageContextId: typeof row.page_context_id === "string" ? row.page_context_id : null
  };
}

export async function recentAnalyses(userId: string, limit = 20, offset = 0) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("job_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []).map(mapAnalysis);
}
