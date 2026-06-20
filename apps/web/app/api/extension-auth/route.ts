import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { signExtensionToken } from "@/lib/auth/extensionToken";
import { getRoleForUser } from "@/lib/auth/roles";
import { isValidExtensionId, upsertExtensionLink } from "@/lib/data/extensionLinks";
import { createSupabaseBearerClient } from "@/lib/supabase/server";

const schema = z.object({
  supabaseAccessToken: z.string().min(10),
  extensionId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const { supabaseAccessToken, extensionId } = schema.parse(await readJson(request));
    if (!isValidExtensionId(extensionId)) {
      return errorResponse("VALIDATION", "A valid Chrome extension ID is required.", 400);
    }
    const supabase = createSupabaseBearerClient(supabaseAccessToken);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return errorResponse("AUTH_REQUIRED", "Invalid Supabase session.", 401);
    const role = await getRoleForUser(data.user.id);
    if (role !== "candidate") {
      return errorResponse("FORBIDDEN", "Browser Copilot extension access is available for candidate accounts only.", 403);
    }
    await upsertExtensionLink(data.user.id, extensionId, "Chrome extension").catch(() => null);
    const signed = await signExtensionToken({ userId: data.user.id, email: data.user.email, extensionId });
    return json({ extensionToken: signed.token, expiresAt: signed.expiresAt, userEmail: data.user.email ?? null });
  } catch (error) {
    return handleRouteError(error);
  }
}
