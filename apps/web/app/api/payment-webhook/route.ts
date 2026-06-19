import { errorResponse, handleRouteError, json } from "@/lib/api";
import { upsertSubscriptionCompat } from "@/lib/data/subscriptions";
import { razorpayPortalLink, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (!verifyRazorpaySignature(raw, request.headers.get("x-razorpay-signature"))) {
      return errorResponse("FORBIDDEN", "Invalid Razorpay signature.", 403);
    }
    const event = JSON.parse(raw) as {
      event?: string;
      payload?: { subscription?: { entity?: Record<string, unknown> } };
    };
    const subscription = event.payload?.subscription?.entity;
    const notes = typeof subscription?.notes === "object" && subscription.notes !== null ? (subscription.notes as Record<string, unknown>) : null;
    const userId = typeof notes?.user_id === "string" ? notes.user_id : null;
    if (userId && event.event && ["subscription.activated", "subscription.charged", "subscription.cancelled"].includes(event.event)) {
      const plan = event.event === "subscription.cancelled" ? "free" : "pro";
      const status = event.event === "subscription.cancelled" ? "cancelled" : "active";
      const customerId = typeof subscription?.customer_id === "string" ? subscription.customer_id : null;
      const supabase = createSupabaseServiceClient();
      await upsertSubscriptionCompat({
        user_id: userId,
        plan,
        status,
        razorpay_customer_id: customerId,
        razorpay_subscription_id: typeof subscription?.id === "string" ? subscription.id : null,
        portal_url: razorpayPortalLink(customerId),
        current_period_end:
          typeof subscription?.current_end === "number" ? new Date(subscription.current_end * 1000).toISOString() : null
      });
      await supabase.from("profiles").update({ plan }).eq("id", userId);
    }
    return json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
