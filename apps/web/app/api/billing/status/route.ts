import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getSubscription } from "@/lib/data/subscriptions";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);
    const data = await getSubscription(user.id);
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
