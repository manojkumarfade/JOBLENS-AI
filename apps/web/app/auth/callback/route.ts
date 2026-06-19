import { NextResponse } from "next/server";
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
    await supabase.auth.exchangeCodeForSession(code);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const profile = await getProfile(data.user.id).catch(() => null);
      const isExtensionReturn = safeNext.startsWith("/login") && safeNext.includes("from=extension");
      const needsName = !profile?.display_name && !profile?.full_name;
      const needsRole = !profile?.hasRoleColumn && !isExtensionReturn;
      if (needsName) {
        const onboardingUrl = new URL("/onboarding", url.origin);
        if (needsRole) onboardingUrl.searchParams.set("next", "/onboarding/role");
        return NextResponse.redirect(onboardingUrl);
      }
      if (needsRole || safeNext.includes("firstRun=1")) {
        redirectTo = new URL("/onboarding/role", url.origin);
      }
    }
  }

  return NextResponse.redirect(redirectTo);
}
