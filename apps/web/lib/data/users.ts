import { createSupabaseServiceClient } from "../supabase/server";

export async function ensureProfile(user: { id: string; email?: string | null; fullName?: string | null }) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.fullName ?? null,
        display_name: user.fullName ?? null
      },
      { onConflict: "id", ignoreDuplicates: false }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,display_name,username,email,avatar_url,plan,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
