import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { razorpayPortalLink } from "@/lib/payments/razorpay";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to manage billing.", 401);
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase.from("subscriptions").select("razorpay_customer_id").eq("user_id", user.id).maybeSingle();
    return json({ url: razorpayPortalLink(data?.razorpay_customer_id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
