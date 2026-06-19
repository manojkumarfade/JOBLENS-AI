import { isMissingSupabaseColumnError, isMissingSupabaseSchemaError } from "@/lib/supabase/schema";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type SubscriptionView = {
  plan: string;
  status: string;
  current_period_end: string | null;
  portal_url: string | null;
  razorpay_customer_id?: string | null;
};

const baseSelect = "plan,current_period_end,status,razorpay_customer_id";
const portalSelect = `${baseSelect},portal_url`;

export async function getSubscription(userId: string): Promise<SubscriptionView | null> {
  const supabase = createSupabaseServiceClient();
  const withPortal = await supabase.from("subscriptions").select(portalSelect).eq("user_id", userId).maybeSingle();
  if (!withPortal.error) return normalizeSubscription(withPortal.data as Record<string, unknown> | null);
  if (!isMissingSupabaseColumnError(withPortal.error, "portal_url")) throw withPortal.error;

  const fallback = await supabase.from("subscriptions").select(baseSelect).eq("user_id", userId).maybeSingle();
  if (fallback.error) {
    if (isMissingSupabaseSchemaError(fallback.error)) return null;
    throw fallback.error;
  }
  return normalizeSubscription(fallback.data as Record<string, unknown> | null);
}

export async function upsertSubscriptionCompat(payload: Record<string, unknown>) {
  const supabase = createSupabaseServiceClient();
  const withPortal = await supabase.from("subscriptions").upsert(payload, { onConflict: "user_id" });
  if (!withPortal.error) return;
  if (!isMissingSupabaseColumnError(withPortal.error, "portal_url")) throw withPortal.error;

  const fallbackPayload = { ...payload };
  delete fallbackPayload.portal_url;
  const fallback = await supabase.from("subscriptions").upsert(fallbackPayload, { onConflict: "user_id" });
  if (fallback.error) throw fallback.error;
}

function normalizeSubscription(row: Record<string, unknown> | null): SubscriptionView | null {
  if (!row) return null;
  return {
    plan: typeof row.plan === "string" ? row.plan : "free",
    status: typeof row.status === "string" ? row.status : "inactive",
    current_period_end: typeof row.current_period_end === "string" ? row.current_period_end : null,
    portal_url: typeof row.portal_url === "string" ? row.portal_url : null,
    razorpay_customer_id: typeof row.razorpay_customer_id === "string" ? row.razorpay_customer_id : null
  };
}
