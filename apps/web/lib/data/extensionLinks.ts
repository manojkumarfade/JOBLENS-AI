import { isMissingSupabaseSchemaError } from "@/lib/supabase/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type ExtensionLink = {
  id: string;
  extension_id: string;
  label: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

export function normalizeExtensionId(value: string) {
  return value.trim().toLowerCase();
}

export function isValidExtensionId(value: string) {
  return /^[a-p]{32}$/.test(normalizeExtensionId(value));
}

export async function listExtensionLinks(userId: string): Promise<ExtensionLink[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_extension_links")
    .select("id,extension_id,label,is_active,last_used_at,created_at,revoked_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingSupabaseSchemaError(error)) return [];
    throw error;
  }
  return (data ?? []).map((row) => row as ExtensionLink);
}

export async function upsertExtensionLink(userId: string, extensionId: string, label?: string | null) {
  const supabase = createSupabaseServiceClient();
  const normalized = normalizeExtensionId(extensionId);
  const { data, error } = await supabase
    .from("user_extension_links")
    .upsert(
      {
        user_id: userId,
        extension_id: normalized,
        label: label?.trim() || null,
        is_active: true,
        revoked_at: null
      },
      { onConflict: "user_id,extension_id" }
    )
    .select("id,extension_id,label,is_active,last_used_at,created_at,revoked_at")
    .single();
  if (error) throw error;
  return data as ExtensionLink;
}

export async function revokeExtensionLink(userId: string, id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("user_extension_links")
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw error;
}

export async function verifyExtensionLink(userId: string, extensionId: string) {
  const supabase = createSupabaseServiceClient();
  const normalized = normalizeExtensionId(extensionId);
  const { data, error } = await supabase
    .from("user_extension_links")
    .select("id")
    .eq("user_id", userId)
    .eq("extension_id", normalized)
    .eq("is_active", true)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) {
    if (isMissingSupabaseSchemaError(error)) return false;
    throw error;
  }
  if (!data?.id) return false;
  await supabase.from("user_extension_links").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return true;
}
