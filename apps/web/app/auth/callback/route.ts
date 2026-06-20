import { NextResponse } from "next/server";
import { setFallbackSessionCookies } from "@/lib/auth/sessionCookies";
import { dashboardForRole, safeDashboardRedirect } from "@/lib/auth/roles";
import { getProfile } from "@/lib/data/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  let redirectTo = new URL(safeNext, url.origin);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionData.session) await setFallbackSessionCookies(sessionData.session);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const profile = await getProfile(data.user.id).catch(() => null);
      const needsName = !profile?.display_name && !profile?.full_name;
      const needsRole = false;
      const role = profile?.user_role === "recruiter" ? "recruiter" : "candidate";
      if (needsName) {
        const onboardingUrl = new URL("/onboarding", url.origin);
        if (needsRole) onboardingUrl.searchParams.set("next", "/onboarding/role");
        return NextResponse.redirect(onboardingUrl);
      }
      if (needsRole || safeNext.includes("firstRun=1") || safeNext === "/onboarding/role") {
        redirectTo = new URL("/onboarding/role", url.origin);
      } else if (safeNext.startsWith("/extension/connect")) {
        redirectTo = new URL(safeNext, url.origin);
      } else {
        redirectTo = new URL(safeDashboardRedirect(safeNext || dashboardForRole(role), role), url.origin);
      }
    }
  }

  return NextResponse.redirect(redirectTo);
}
