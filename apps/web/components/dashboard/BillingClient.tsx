"use client";

import { useState } from "react";
import Link from "next/link";
import { RazorpayCheckoutButton } from "@/components/dashboard/RazorpayCheckoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingClient({ plan, renewalDate, portalUrl }: { plan?: string | null; renewalDate?: string | null; portalUrl?: string | null }) {
  const [message, setMessage] = useState("");

  async function openPortal() {
    if (portalUrl) {
      window.location.assign(portalUrl);
      return;
    }
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.assign(data.url);
    else setMessage("Subscription portal is not configured yet.");
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Current plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-semibold">{plan ?? "free"}</p>
          <p className="text-sm text-muted-foreground">Renewal date: {renewalDate ?? "Not available"}</p>
          <div className="flex flex-wrap gap-2">
            <RazorpayCheckoutButton period="monthly">Upgrade monthly</RazorpayCheckoutButton>
            <RazorpayCheckoutButton period="yearly">Upgrade yearly</RazorpayCheckoutButton>
            <Button variant="outline" onClick={openPortal}>Manage subscription</Button>
            <Button asChild variant="outline"><Link href="/dashboard/settings/voice">Switch to BYOK</Link></Button>
          </div>
        </CardContent>
      </Card>
      {message ? <p className="rounded-md border bg-muted p-3 text-sm">{message}</p> : null}
    </div>
  );
}
