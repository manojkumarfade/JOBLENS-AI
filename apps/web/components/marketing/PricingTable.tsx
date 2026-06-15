import Link from "next/link";
import { Check } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/dashboard/RazorpayCheckoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Fast & Free Voice with platform default brain model.",
    features: ["Web Speech voice mode", "Limited analyses/month", "Resume upload", "Saved analyses"]
  },
  {
    name: "Pro",
    price: "₹400/month",
    description: "Natural Call Voice with included platform-hosted minutes.",
    features: ["Auto Select voice", "Natural Call Voice", "Higher monthly limits", "Priority platform models"]
  },
  {
    name: "BYOK",
    price: "₹0 add-on",
    description: "Bring TypeGPT, Gemini, and LiveKit keys for direct provider billing.",
    features: ["Use any supported model", "Natural Call on Free with keys", "JobLens-side unlimited", "Encrypted key storage"]
  }
];

export function PricingTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className="flex flex-col">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <p className="text-2xl font-semibold">{plan.price}</p>
            <p className="text-sm leading-6 text-muted-foreground">{plan.description}</p>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {plan.features.slice(0, compact ? 3 : plan.features.length).map((feature) => (
              <p key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 text-primary" /> {feature}
              </p>
            ))}
          </CardContent>
          <CardFooter>
            {plan.name === "Pro" ? (
              <RazorpayCheckoutButton period="monthly" className="w-full">Pay ₹400/month</RazorpayCheckoutButton>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={plan.name === "Free" ? "/install-extension" : "/dashboard/settings/voice"}>
                  {plan.name === "Free" ? "Start free" : "Configure BYOK"}
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
