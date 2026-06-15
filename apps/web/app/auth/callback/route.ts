import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const redirectTo = new URL(safeNext, url.origin);

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const service = createSupabaseServiceClient();
      const { data: profile } = await service
        .from("profiles")
        .select("display_name,full_name")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!profile?.display_name && !profile?.full_name) {
        return NextResponse.redirect(new URL("/onboarding", url.origin));
      }
    }
  }

  return NextResponse.redirect(redirectTo);
}
