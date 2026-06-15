import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to delete resumes.", 401);
    const { id } = await params;
    const supabase = createSupabaseServiceClient();

    const { data: resume, error: readError } = await supabase
      .from("resumes")
      .select("id,file_path,is_active")
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!resume) return errorResponse("NOT_FOUND", "Resume not found.", 404);

    if (resume.file_path) await supabase.storage.from("resumes").remove([resume.file_path]);

    const { error: deleteError } = await supabase.from("resumes").delete().eq("user_id", user.id).eq("id", id);
    if (deleteError) throw deleteError;

    let activeResumeId: string | null = null;
    if (resume.is_active) {
      const { data: nextResume, error: nextError } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (nextError) throw nextError;
      if (nextResume?.id) {
        const { error: activeError } = await supabase
          .from("resumes")
          .update({ is_active: true })
          .eq("user_id", user.id)
          .eq("id", nextResume.id);
        if (activeError) throw activeError;
        activeResumeId = nextResume.id;
      }
    }

    return json({ ok: true, activeResumeId });
  } catch (error) {
    return handleRouteError(error);
  }
}
