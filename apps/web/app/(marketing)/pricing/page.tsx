import { MarketingPage } from "@/components/marketing/MarketingShell";
import { PricingTable } from "@/components/marketing/PricingTable";
import { PricingInteraction } from "@/components/ui/pricing-interaction";

export default function PricingPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold">Start free. Upgrade for natural voice calls, or bring your own AI keys for unlimited use.</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Free users get Fast & Free Voice. Pro adds Razorpay-powered access to platform-hosted Natural Call Voice. BYOK keeps provider billing directly in your hands.
            </p>
          </div>
          <PricingInteraction proMonth={400} proAnnual={4000} />
        </div>
        <PricingTable />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            ["What's the difference between voices?", "Fast & Free uses browser Web Speech. Natural Call uses LiveKit and Gemini Live."],
            ["What does BYOK mean?", "You enter your own TypeGPT, Gemini, or LiveKit credentials. They are encrypted and used only server-side."],
            ["Can I switch models any time?", "Yes. Model and API key settings live in /dashboard/settings/voice."],
            ["Is my API key safe?", "Keys are encrypted at rest, never shown again after saving, and never sent to the extension."]
          ].map(([q, a]) => (
            <section key={q} className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">{q}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p>
            </section>
          ))}
        </div>
      </main>
    </MarketingPage>
  );
}
