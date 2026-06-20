import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_MAX_AGE,
  JOBLENS_ACCESS_COOKIE,
  JOBLENS_REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  authCookieOptions
} from "./sessionCookieConfig";

type SessionTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_in?: number | null;
};

export async function setFallbackSessionCookies(session: SessionTokens) {
  const cookieStore = await cookies();
  if (session.access_token) {
    cookieStore.set(
      JOBLENS_ACCESS_COOKIE,
      session.access_token,
      authCookieOptions(Math.max(60, session.expires_in ?? ACCESS_COOKIE_MAX_AGE))
    );
  }
  if (session.refresh_token) {
    cookieStore.set(JOBLENS_REFRESH_COOKIE, session.refresh_token, authCookieOptions(REFRESH_COOKIE_MAX_AGE));
  }
}

export async function clearFallbackSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.set(JOBLENS_ACCESS_COOKIE, "", authCookieOptions(0));
  cookieStore.set(JOBLENS_REFRESH_COOKIE, "", authCookieOptions(0));
}

export async function readFallbackSessionCookies(request?: Request) {
  if (request) {
    const parsed = parseCookieHeader(request.headers.get("cookie") ?? "");
    return {
      accessToken: parsed.get(JOBLENS_ACCESS_COOKIE) ?? null,
      refreshToken: parsed.get(JOBLENS_REFRESH_COOKIE) ?? null
    };
  }

  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(JOBLENS_ACCESS_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(JOBLENS_REFRESH_COOKIE)?.value ?? null
  };
}

function parseCookieHeader(header: string) {
  const values = new Map<string, string>();
  for (const pair of header.split(";")) {
    const index = pair.indexOf("=");
    if (index === -1) continue;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!key) continue;
    values.set(key, decodeURIComponent(value));
  }
  return values;
}
