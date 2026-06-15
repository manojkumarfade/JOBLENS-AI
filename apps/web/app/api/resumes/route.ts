import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to view resumes.", 401);
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("resumes")
      .select("id,original_filename,skills,projects,experience_level,is_active,created_at,parsed_text")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return json({
      resumes: (data ?? []).map((resume) => ({
        ...resume,
        parsed_text: resume.parsed_text ? String(resume.parsed_text).slice(0, 500) : null
      }))
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
