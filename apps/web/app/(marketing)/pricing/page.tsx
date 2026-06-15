import { MarketingPage } from "@/components/marketing/MarketingShell";
import { PricingTable } from "@/components/marketing/PricingTable";
import { PricingInteraction } from "@/components/ui/pricing-interaction";

export default function PricingPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold">Start free. Upgrade for more analyses, or bring your own TypeGPT key for unlimited use.</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Free users get browser voice conversation. Pro adds higher monthly limits and faster TypeGPT responses. BYOK keeps provider billing directly in your hands.
            </p>
          </div>
          <PricingInteraction proMonth={400} proAnnual={4000} />
        </div>
        <PricingTable />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            ["How does voice work?", "JobLens uses your browser's Web Speech APIs for speech recognition and synthesis."],
            ["What does BYOK mean?", "You enter your own TypeGPT credential. It is encrypted and used only server-side."],
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
