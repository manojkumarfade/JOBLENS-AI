import { handleRouteError, json } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const user = auth.user;
    const { id } = await params;
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("job_analyses").delete().eq("user_id", user.id).eq("id", id);
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
