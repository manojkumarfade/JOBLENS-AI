"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckoutButton({
  period = "monthly",
  children = "Upgrade to Pro",
  className
}: {
  period?: "monthly" | "yearly";
  children?: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function checkout() {
    setLoading(true);
    setMessage("");
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      setMessage("Could not load Razorpay Checkout.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period })
    });
    const order = await res.json();
    if (!res.ok || !order.orderId || !order.keyId) {
      setMessage(order.error?.message ?? "Razorpay checkout is not configured yet.");
      setLoading(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "JobLens Recruiter AI",
      description: order.description,
      order_id: order.orderId,
      theme: { color: "#4c9a68" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        const verify = await fetch("/api/billing/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            period
          })
        });
        setMessage(verify.ok ? "Payment verified. Pro is active." : "Payment could not be verified.");
        setLoading(false);
      },
      modal: {
        ondismiss: () => setLoading(false)
      }
    });

    razorpay.open();
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={checkout} disabled={loading} className={className}>
        <CreditCard className="h-4 w-4" /> {loading ? "Opening Razorpay..." : children}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
