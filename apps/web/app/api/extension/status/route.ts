import { handleRouteError, json } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";

export async function GET(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;

    return json({
      ok: true,
      email: auth.user.email,
      role: auth.role,
      extension: {
        connected: true
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
