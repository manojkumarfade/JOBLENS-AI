import { createSupabaseServiceClient } from "../supabase/server";

export type UserRole = "candidate" | "recruiter";

export interface ProfileView {
  id: string;
  full_name: string | null;
  display_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: string | null;
  user_role: UserRole;
  created_at: string | null;
  hasRoleColumn: boolean;
  candidate_tutorial_seen_at: string | null;
  recruiter_tutorial_seen_at: string | null;
}

type ProfileRow = Record<string, unknown>;

export async function ensureProfile(user: { id: string; email?: string | null; fullName?: string | null }) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.fullName ?? null
      },
      { onConflict: "id", ignoreDuplicates: false }
    );
  if (error) throw error;

  if (user.fullName) {
    await updateOptionalProfileColumns(user.id, { display_name: user.fullName });
  }

  return getProfile(user.id);
}

export async function getProfile(userId: string): Promise<ProfileView | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function updateProfileCompat(
  userId: string,
  input: {
    displayName?: string;
    username?: string;
    userRole?: UserRole;
  }
) {
  const supabase = createSupabaseServiceClient();
  const basePatch: Record<string, unknown> = {};
  if (input.displayName !== undefined) basePatch.full_name = input.displayName;

  if (Object.keys(basePatch).length) {
    const { error } = await supabase.from("profiles").update(basePatch).eq("id", userId);
    if (error) throw error;
  }

  const optionalPatch: Record<string, unknown> = {};
  if (input.displayName !== undefined) optionalPatch.display_name = input.displayName;
  if (input.username !== undefined) optionalPatch.username = input.username || null;
  if (input.userRole !== undefined) optionalPatch.user_role = input.userRole;

  await updateOptionalProfileColumns(userId, optionalPatch);
  return getProfile(userId);
}

async function updateOptionalProfileColumns(userId: string, patch: Record<string, unknown>) {
  if (!Object.keys(patch).length) return;
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (!error) return;
  if (isOptionalProfileColumnError(error)) return;
  throw error;
}

export function mapProfile(row: ProfileRow): ProfileView {
  const fullName = typeof row.full_name === "string" ? row.full_name : null;
  const displayName = typeof row.display_name === "string" ? row.display_name : fullName;
  const role = row.user_role === "recruiter" ? "recruiter" : "candidate";
  return {
    id: String(row.id ?? ""),
    full_name: fullName,
    display_name: displayName,
    username: typeof row.username === "string" ? row.username : null,
    email: typeof row.email === "string" ? row.email : null,
    avatar_url: typeof row.avatar_url === "string" ? row.avatar_url : null,
    plan: typeof row.plan === "string" ? row.plan : "free",
    user_role: role,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
    hasRoleColumn: Object.prototype.hasOwnProperty.call(row, "user_role"),
    candidate_tutorial_seen_at: typeof row.candidate_tutorial_seen_at === "string" ? row.candidate_tutorial_seen_at : null,
    recruiter_tutorial_seen_at: typeof row.recruiter_tutorial_seen_at === "string" ? row.recruiter_tutorial_seen_at : null
  };
}

export function isOptionalProfileColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message : "";
  return (
    candidate.code === "42703" ||
    candidate.code === "PGRST204" ||
    message.includes("display_name") ||
    message.includes("username") ||
    message.includes("user_role")
  );
}
