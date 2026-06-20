import { NextResponse } from "next/server";
import { clearFallbackSessionCookies } from "@/lib/auth/sessionCookies";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearFallbackSessionCookies();
  return NextResponse.redirect(new URL("/login", request.url));
}
