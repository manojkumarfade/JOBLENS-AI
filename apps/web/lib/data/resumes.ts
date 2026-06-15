import { createSupabaseServiceClient } from "../supabase/server";

export async function activeResume(userId: string, resumeId?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("resumes").select("*").eq("user_id", userId);
  if (resumeId) query = query.eq("id", resumeId);
  else query = query.eq("is_active", true).order("created_at", { ascending: false }).limit(1);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export function resumeSummary(row: Record<string, unknown> | null) {
  if (!row) return null;
  return {
    resumeId: typeof row.id === "string" ? row.id : null,
    summary: row.parsed_text ? String(row.parsed_text).slice(0, 2500) : "",
    skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
    projects: Array.isArray(row.projects) ? row.projects.map(String) : [],
    experienceLevel: typeof row.experience_level === "string" ? row.experience_level : "unknown"
  };
}
