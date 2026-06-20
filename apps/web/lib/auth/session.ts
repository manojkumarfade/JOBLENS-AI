import type { User } from "@supabase/supabase-js";
import { createSupabaseAuthClient, createSupabaseBearerClient, createSupabaseServerClient } from "../supabase/server";
import { verifyExtensionToken } from "./extensionToken";
import { readFallbackSessionCookies, setFallbackSessionCookies } from "./sessionCookies";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  supabaseUser?: User;
}

function bearerToken(request?: Request) {
  const header = request?.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice("bearer ".length).trim();
}

export async function getAuthenticatedUser(request?: Request): Promise<AuthenticatedUser | null> {
  const token = bearerToken(request);

  if (token) {
    try {
      return await verifyExtensionToken(token);
    } catch {
      const user = await userFromAccessToken(token);
      if (user) return user;
    }
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return userFromFallbackCookies(request);
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    supabaseUser: data.user
  };
}

async function userFromAccessToken(token: string): Promise<AuthenticatedUser | null> {
  const supabase = createSupabaseBearerClient(token);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    supabaseUser: data.user
  };
}

async function userFromFallbackCookies(request?: Request): Promise<AuthenticatedUser | null> {
  const tokens = await readFallbackSessionCookies(request);
  if (tokens.accessToken) {
    const user = await userFromAccessToken(tokens.accessToken);
    if (user) return user;
  }

  if (!tokens.refreshToken) return null;

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: tokens.refreshToken });
  if (error || !data.session || !data.user) return null;

  await setFallbackSessionCookies(data.session).catch(() => null);
  try {
    const serverSupabase = await createSupabaseServerClient();
    await serverSupabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch {
    // Server Components cannot always set cookies; API routes and middleware still can.
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    supabaseUser: data.user
  };
}
