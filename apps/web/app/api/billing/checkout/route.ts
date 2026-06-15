import { z } from "zod";
import { errorResponse, handleRouteError, json } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

const schema = z.object({
  period: z.enum(["monthly", "yearly"]).default("monthly")
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to manage billing.", 401);
    const body = schema.parse(await request.json().catch(() => ({})));
    const order = await createRazorpayOrder({ userId: user.id, email: user.email, period: body.period });
    return json(order ?? { orderId: null, keyId: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
