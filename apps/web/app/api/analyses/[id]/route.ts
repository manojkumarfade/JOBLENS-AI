import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to delete analyses.", 401);
    const { id } = await params;
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("job_analyses").delete().eq("user_id", user.id).eq("id", id);
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
