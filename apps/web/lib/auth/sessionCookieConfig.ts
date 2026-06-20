export const JOBLENS_ACCESS_COOKIE = "joblens_access_token";
export const JOBLENS_REFRESH_COOKIE = "joblens_refresh_token";

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

export const ACCESS_COOKIE_MAX_AGE = 60 * 60;
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
