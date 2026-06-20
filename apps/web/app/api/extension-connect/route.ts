import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { signExtensionToken } from "@/lib/auth/extensionToken";
import { requireApiRole } from "@/lib/auth/roles";
import { isValidExtensionId, upsertExtensionLink } from "@/lib/data/extensionLinks";

const schema = z.object({
  extensionId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;

    const body = schema.parse(await readJson(request));
    if (!isValidExtensionId(body.extensionId)) {
      return errorResponse("VALIDATION", "A valid Chrome extension ID is required.", 400);
    }

    await upsertExtensionLink(auth.user.id, body.extensionId, "Chrome extension").catch(() => null);
    const signed = await signExtensionToken({
      userId: auth.user.id,
      email: auth.user.email,
      extensionId: body.extensionId
    });

    return json({
      ok: true,
      extensionToken: signed.token,
      expiresAt: signed.expiresAt,
      userEmail: auth.user.email ?? null
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
