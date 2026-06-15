import type { User } from "@supabase/supabase-js";
import { createSupabaseBearerClient, createSupabaseServerClient } from "../supabase/server";
import { verifyExtensionToken } from "./extensionToken";

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
      const supabase = createSupabaseBearerClient(token);
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        return {
          id: data.user.id,
          email: data.user.email ?? null,
          supabaseUser: data.user
        };
      }
    }
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    supabaseUser: data.user
  };
}
