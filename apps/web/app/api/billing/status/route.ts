import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan,current_period_end,portal_url,status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return json({
      plan: data?.plan ?? "free",
      status: data?.status ?? "inactive",
      renewsAt: data?.current_period_end ?? null,
      portalUrl: data?.portal_url ?? null
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
