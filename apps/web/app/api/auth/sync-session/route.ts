import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { dashboardForRole, getRoleForUser, safeDashboardRedirect } from "@/lib/auth/roles";
import { setFallbackSessionCookies } from "@/lib/auth/sessionCookies";
import { ensureProfile } from "@/lib/data/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  accessToken: z.string().min(10),
  refreshToken: z.string().min(10),
  next: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await readJson(request));
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.setSession({
      access_token: body.accessToken,
      refresh_token: body.refreshToken
    });

    if (error || !data.user) {
      return errorResponse("AUTH_REQUIRED", "Your login session could not be restored. Please sign in again.", 401);
    }
    if (data.session) await setFallbackSessionCookies(data.session);

    await ensureProfile({
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : null
    }).catch(() => null);

    const role = await getRoleForUser(data.user.id);
    const dashboard = dashboardForRole(role);
    return json({
      ok: true,
      email: data.user.email ?? null,
      role,
      redirectTo: safeDashboardRedirect(body.next ?? dashboard, role)
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
