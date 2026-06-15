import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to delete data.", 401);
    const supabase = createSupabaseServiceClient();
    const { data: resumes } = await supabase.from("resumes").select("file_path").eq("user_id", user.id);
    const paths = (resumes ?? []).map((row) => row.file_path).filter(Boolean);
    if (paths.length) await supabase.storage.from("resumes").remove(paths);
    await supabase.from("voice_transcripts").delete().eq("user_id", user.id);
    await supabase.from("voice_sessions").delete().eq("user_id", user.id);
    await supabase.from("job_analyses").delete().eq("user_id", user.id);
    await supabase.from("page_contexts").delete().eq("user_id", user.id);
    await supabase.from("resumes").delete().eq("user_id", user.id);
    await supabase.from("user_model_credentials").delete().eq("user_id", user.id);
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
