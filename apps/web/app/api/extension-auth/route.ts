import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { signExtensionToken } from "@/lib/auth/extensionToken";
import { createSupabaseBearerClient } from "@/lib/supabase/server";

const schema = z.object({ supabaseAccessToken: z.string().min(10) });

export async function POST(request: Request) {
  try {
    const { supabaseAccessToken } = schema.parse(await readJson(request));
    const supabase = createSupabaseBearerClient(supabaseAccessToken);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return errorResponse("AUTH_REQUIRED", "Invalid Supabase session.", 401);
    const signed = await signExtensionToken({ userId: data.user.id, email: data.user.email });
    return json({ extensionToken: signed.token, expiresAt: signed.expiresAt });
  } catch (error) {
    return handleRouteError(error);
  }
}
