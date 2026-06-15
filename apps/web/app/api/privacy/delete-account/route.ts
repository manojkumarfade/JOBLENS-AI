import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to delete account.", 401);
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
