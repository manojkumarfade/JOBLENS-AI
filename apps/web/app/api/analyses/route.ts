import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { recentAnalyses } from "@/lib/data/analyses";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to view analyses.", 401);
    return json({ analyses: await recentAnalyses(user.id, 50) });
  } catch (error) {
    return handleRouteError(error);
  }
}
