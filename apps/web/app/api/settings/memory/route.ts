import { z } from "zod";
import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const putSchema = z.object({
  memory_text: z.string().max(8000)
});

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("user_ai_memory")
      .select("memory_text,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return json({ memory_text: data?.memory_text ?? "", updated_at: data?.updated_at ?? null });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in first.", 401);
    const body = putSchema.safeParse(await request.json());
    if (!body.success) return errorResponse("VALIDATION", body.error.message, 400);
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from("user_ai_memory")
      .upsert({ user_id: user.id, memory_text: body.data.memory_text }, { onConflict: "user_id" });
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
