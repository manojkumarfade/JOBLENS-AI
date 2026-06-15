import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await readJson(request));
    if (!body.success) return errorResponse("VALIDATION", body.error.message, 400);
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = data.users.find((item) => item.email?.toLowerCase() === body.data.email.toLowerCase());
    if (!user) return json({ method: "unknown" });
    const providers = user.identities?.map((identity) => identity.provider) ?? [];
    return json({ method: providers.includes("google") && !providers.includes("email") ? "google" : "password" });
  } catch (error) {
    return handleRouteError(error);
  }
}
