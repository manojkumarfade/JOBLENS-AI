import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { deleteAllUserData } from "@/lib/privacy/deleteData";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to delete data.", 401);
    await deleteAllUserData(user.id);
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
