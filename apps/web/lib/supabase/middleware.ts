import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ACCESS_COOKIE_MAX_AGE,
  JOBLENS_ACCESS_COOKIE,
  JOBLENS_REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  authCookieOptions
} from "@/lib/auth/sessionCookieConfig";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      response.cookies.set(
        JOBLENS_ACCESS_COOKIE,
        sessionData.session.access_token,
        authCookieOptions(Math.max(60, sessionData.session.expires_in ?? ACCESS_COOKIE_MAX_AGE))
      );
    }
    if (sessionData.session?.refresh_token) {
      response.cookies.set(JOBLENS_REFRESH_COOKIE, sessionData.session.refresh_token, authCookieOptions(REFRESH_COOKIE_MAX_AGE));
    }
  }
  return response;
}
