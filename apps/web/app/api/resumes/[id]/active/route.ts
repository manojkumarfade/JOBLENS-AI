import { errorResponse, handleRouteError, json } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const user = auth.user;
    const { id } = await params;
    const supabase = createSupabaseServiceClient();
    const { data: resume, error: readError } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();
    if (readError) throw readError;
    if (!resume) return errorResponse("NOT_FOUND", "Resume not found.", 404);
    await supabase.from("resumes").update({ is_active: false }).eq("user_id", user.id);
    const { error } = await supabase.from("resumes").update({ is_active: true }).eq("user_id", user.id).eq("id", id);
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
