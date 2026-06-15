import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { verifyRazorpayCheckoutSignature } from "@/lib/payments/razorpay";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  period: z.enum(["monthly", "yearly"]).default("monthly")
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to verify billing.", 401);
    const body = schema.parse(await readJson(request));
    const valid = verifyRazorpayCheckoutSignature(body);
    if (!valid) return errorResponse("FORBIDDEN", "Invalid Razorpay payment signature.", 403);

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (body.period === "monthly" ? 1 : 12));

    const supabase = createSupabaseServiceClient();
    await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "pro",
          status: "active",
          razorpay_subscription_id: body.razorpayPaymentId,
          current_period_end: currentPeriodEnd.toISOString()
        },
        { onConflict: "user_id" }
      );
    await supabase.from("profiles").update({ plan: "pro" }).eq("id", user.id);

    return json({ ok: true, plan: "pro", currentPeriodEnd: currentPeriodEnd.toISOString() });
  } catch (error) {
    return handleRouteError(error);
  }
}
