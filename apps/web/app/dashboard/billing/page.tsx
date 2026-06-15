import { redirect } from "next/navigation";
import { BillingClient } from "@/components/dashboard/BillingClient";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Billing</h1>
        <p className="mt-2 text-muted-foreground">Manage your plan, renewal state, and BYOK shortcut.</p>
      </div>
      <BillingClient plan={data?.plan ?? "free"} renewalDate={data?.current_period_end ?? null} />
    </div>
  );
}
