"use client";

import NumberFlow from "@number-flow/react";
import { useState } from "react";
import { RazorpayCheckoutButton } from "@/components/dashboard/RazorpayCheckoutButton";
import { AuthAwareDashboardLink } from "@/components/marketing/AuthAwareDashboardLink";
import { cn } from "@/lib/utils";

export function PricingInteraction({
  proMonth,
  proAnnual,
  className
}: {
  proMonth: number;
  proAnnual: number;
  className?: string;
}) {
  const [active, setActive] = useState<"free" | "pro" | "byok">("pro");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const price = period === "monthly" ? proMonth : proAnnual;

  return (
    <div className={cn("w-full max-w-sm rounded-[28px] border bg-card p-3 shadow-xl", className)}>
      <div className="relative mb-3 flex rounded-full bg-muted p-1.5">
        {(["monthly", "yearly"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className="z-20 w-full rounded-full p-1.5 text-sm font-semibold"
            onClick={() => setPeriod(item)}
          >
            {item === "monthly" ? "Monthly" : "Yearly"}
          </button>
        ))}
        <div
          className="absolute inset-y-1.5 z-10 w-[calc(50%-0.375rem)] rounded-full bg-background shadow-sm transition-transform"
          style={{ transform: `translateX(${period === "yearly" ? "100%" : "0"})` }}
        />
      </div>
      <div className="relative space-y-3">
        <PlanRow active={active === "free"} title="Free" subtitle="Rs 0/month" onClick={() => setActive("free")} />
        <PlanRow
          active={active === "pro"}
          title="Pro"
          badge="Popular"
          subtitle={
            <span>
              Rs <NumberFlow value={price} />/{period === "monthly" ? "month" : "year"}
            </span>
          }
          onClick={() => setActive("pro")}
        />
        <PlanRow active={active === "byok"} title="BYOK" subtitle="Free add-on, provider-billed" onClick={() => setActive("byok")} />
      </div>
      <div className="mt-3">
        {active === "pro" ? (
          <RazorpayCheckoutButton period={period} className="w-full rounded-full">
            Pay with Razorpay
          </RazorpayCheckoutButton>
        ) : active === "byok" ? (
          <AuthAwareDashboardLink href="/dashboard/settings/voice" button className="w-full rounded-full" variant="outline">
            Configure BYOK
          </AuthAwareDashboardLink>
        ) : (
          <AuthAwareDashboardLink href="/dashboard" button className="w-full rounded-full" variant="outline">
            Start free
          </AuthAwareDashboardLink>
        )}
      </div>
    </div>
  );
}

function PlanRow({
  active,
  title,
  subtitle,
  badge,
  onClick
}: {
  active: boolean;
  title: string;
  subtitle: React.ReactNode;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex min-h-[88px] w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-colors",
        active ? "border-foreground" : "border-border hover:border-primary/60"
      )}
      onClick={onClick}
    >
      <span>
        <span className="flex items-center gap-2 text-lg font-semibold">
          {title}
          {badge ? <span className="rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">{badge}</span> : null}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">{subtitle}</span>
      </span>
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2", active ? "border-foreground" : "border-muted-foreground")}>
        <span className={cn("h-3 w-3 rounded-full bg-foreground transition-opacity", active ? "opacity-100" : "opacity-0")} />
      </span>
    </button>
  );
}
