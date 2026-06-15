import crypto from "crypto";
import { env, requiredEnv } from "../env";

export type ProBillingPeriod = "monthly" | "yearly";

export function proPriceInr(period: ProBillingPeriod) {
  return Number(env(period === "monthly" ? "RAZORPAY_PRO_MONTHLY_INR" : "RAZORPAY_PRO_YEARLY_INR", period === "monthly" ? "400" : "4000"));
}

export function verifyRazorpaySignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = requiredEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function createRazorpayOrder(input: { userId: string; period: ProBillingPeriod; email?: string | null }) {
  const keyId = env("RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    return null;
  }

  const amountInr = proPriceInr(input.period);
  const receipt = `joblens_${input.period}_${Date.now()}`.slice(0, 40);
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountInr * 100,
      currency: "INR",
      receipt,
      notes: {
        user_id: input.userId,
        plan: "pro",
        period: input.period,
        email: input.email ?? ""
      }
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Razorpay order failed with ${res.status}: ${body.slice(0, 200)}`);
  }

  const order = (await res.json()) as { id: string; amount: number; currency: string };
  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
    name: "JobLens Voice Pro",
    description: input.period === "monthly" ? "Pro monthly access" : "Pro yearly access",
    period: input.period
  };
}

export function verifyRazorpayCheckoutSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const expected = crypto
    .createHmac("sha256", requiredEnv("RAZORPAY_KEY_SECRET"))
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.razorpaySignature));
}

export function razorpayPortalLink(customerId?: string | null) {
  if (!customerId) return null;
  return `https://dashboard.razorpay.com/app/customers/${encodeURIComponent(customerId)}`;
}
