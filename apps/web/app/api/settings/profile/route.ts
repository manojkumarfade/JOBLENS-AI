import { z } from "zod";
import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getProfile, isOptionalProfileColumnError, updateProfileCompat } from "@/lib/data/users";

const schema = z.object({
  display_name: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Username may only contain lowercase letters, numbers, - or _")
    .optional(),
  user_role: z.enum(["candidate", "recruiter"]).optional()
});

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);

    const body = schema.safeParse(await request.json());
    if (!body.success) return errorResponse("VALIDATION", body.error.message, 400);

    const profile = await updateProfileCompat(user.id, {
      displayName: body.data.display_name,
      username: body.data.username,
      userRole: body.data.user_role
    });
    return json({ ok: true, profile });
  } catch (error) {
    if (error && typeof error === "object" && (error as { code?: unknown }).code === "23505") {
      return errorResponse("CONFLICT", "That username is already taken.", 409);
    }
    if (isOptionalProfileColumnError(error)) {
      return json({ ok: true, warning: "Optional profile columns are not applied yet." });
    }
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);
    return json((await getProfile(user.id)) ?? {});
  } catch (error) {
    return handleRouteError(error);
  }
}
