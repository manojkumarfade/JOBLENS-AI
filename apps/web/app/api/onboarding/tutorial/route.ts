import { z } from "zod";
import { handleRouteError, json, readJson } from "@/lib/api";
import { requireApiRole } from "@/lib/auth/roles";
import { markTutorialSeen } from "@/lib/data/tutorials";

const schema = z.object({
  target: z.enum(["candidate", "recruiter"])
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await readJson(request));
    const auth = await requireApiRole(request, body.target);
    if (!auth.ok) return auth.response;
    await markTutorialSeen(auth.user.id, body.target);
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
