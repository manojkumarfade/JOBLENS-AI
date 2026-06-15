import { z } from "zod";
import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  display_name: z.string().min(1).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Username may only contain lowercase letters, numbers, - or _")
    .optional()
});

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);

    const body = schema.safeParse(await request.json());
    if (!body.success) return errorResponse("VALIDATION", body.error.message, 400);

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        ...(body.data.display_name !== undefined && { display_name: body.data.display_name }),
        ...(body.data.username !== undefined && { username: body.data.username }),
        full_name: body.data.display_name ?? undefined
      })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") return errorResponse("CONFLICT", "That username is already taken.", 409);
      throw error;
    }
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name,username,display_name,email,avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    return json(data ?? {});
  } catch (error) {
    return handleRouteError(error);
  }
}
