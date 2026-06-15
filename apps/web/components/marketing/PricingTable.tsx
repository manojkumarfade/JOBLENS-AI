import Link from "next/link";
import { Check } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/dashboard/RazorpayCheckoutButton";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "Rs 0",
    description: "Start with voice conversation and core job analysis.",
    features: ["Voice conversation (Web Speech)", "Limited analyses/month", "Resume upload", "Saved analyses"]
  },
  {
    name: "Pro",
    price: "Rs 400/month",
    description: "More room and faster responses for active searches.",
    features: ["Higher monthly limits", "Priority TypeGPT models", "Faster responses"]
  },
  {
    name: "BYOK",
    price: "Rs 0 add-on",
    description: "Use your own TypeGPT key for unlimited usage on JobLens.",
    features: ["Bring your own TypeGPT key", "Unlimited usage on JobLens", "Encrypted key storage"]
  }
];

export function PricingTable({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "mx-auto max-w-6xl px-4 py-20"}>
      {!compact ? (
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Pricing</p>
          <h2 className="mt-3 font-display text-4xl font-bold">Start free. Pay only if you want more.</h2>
          <p className="mt-4 text-muted-foreground">No hidden fees. Bring your own TypeGPT key any time for unlimited use.</p>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={`flex flex-col rounded-2xl border bg-card p-6 ${plan.name === "Pro" ? "border-accent shadow-lg lg:scale-[1.02]" : "shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)]"}`}>
            <div>
              <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
              <p className="mt-3 font-display text-3xl font-bold">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
            </div>
            <div className="mt-6 flex-1 space-y-3">
              {plan.features.slice(0, compact ? 3 : plan.features.length).map((feature) => (
                <p key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-primary" /> {feature}
                </p>
              ))}
            </div>
            <div className="mt-6">
              {plan.name === "Pro" ? (
                <RazorpayCheckoutButton period="monthly" className="w-full rounded-full">Pay Rs 400/month</RazorpayCheckoutButton>
              ) : (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={plan.name === "Free" ? "/install-extension" : "/dashboard/settings/voice"}>
                    {plan.name === "Free" ? "Start free" : "Configure BYOK"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border bg-muted p-5 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">Need this for your campus placement cell or bootcamp cohort?</p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="mailto:hello@joblens.local">Contact us</Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
