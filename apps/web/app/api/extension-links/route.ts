import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import {
  isValidExtensionId,
  listExtensionLinks,
  revokeExtensionLink,
  upsertExtensionLink
} from "@/lib/data/extensionLinks";

const createSchema = z.object({
  extensionId: z.string().min(1),
  label: z.string().max(80).optional()
});

const deleteSchema = z.object({
  id: z.string().uuid()
});

export async function GET(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const links = await listExtensionLinks(auth.user.id);
    return json({ links });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const body = createSchema.parse(await readJson(request));
    if (!isValidExtensionId(body.extensionId)) {
      return errorResponse("VALIDATION", "Paste the 32-character Chrome extension ID from the extension popup.", 400);
    }
    const link = await upsertExtensionLink(auth.user.id, body.extensionId, body.label);
    return json({ ok: true, link });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireApiRole(request, "candidate");
    if (!auth.ok) return auth.response;
    const body = deleteSchema.parse(await readJson(request));
    await revokeExtensionLink(auth.user.id, body.id);
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
