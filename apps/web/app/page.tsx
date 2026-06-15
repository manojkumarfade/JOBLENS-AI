import Link from "next/link";
import { ArrowRight, CreditCard, KeyRound, Mic2, ShieldCheck } from "lucide-react";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

export default function HomePage() {
  return (
    <MarketingPage>
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/generated/joblens-voice-orb-panel.png"
        bgImageSrc="/generated/joblens-scroll-bg.png"
        title="JobLens Voice"
        date="Voice-first career copilot"
        scrollToExpand="Scroll to expand the product"
        textBlend
      >
        <div id="about" className="grid gap-6 rounded-lg border bg-card/85 p-6 shadow-xl backdrop-blur lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-semibold">Understand a role before you spend time applying.</h2>
            <p className="mt-4 text-muted-foreground">
              JobLens Voice reads the job page after your click, compares it with your real resume evidence, answers follow-up questions, and helps tailor application material without inventing experience.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            {[
              ["Fast & Free", "Browser voice with Web Speech API."],
              ["Natural Call", "LiveKit + Gemini Live for real-time conversation."],
              ["BYOK", "Encrypted TypeGPT, Gemini, and LiveKit credentials."],
              ["Truthful tailoring", "Suggestions stay grounded in your uploaded resume."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border bg-background/70 p-3">
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollExpandMedia>
      <section className="border-y bg-muted/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
          {["Click the button", "Get instant analysis", "Ask by voice"].map((step, index) => (
            <Card key={step}>
              <CardHeader>
                <CardTitle className="text-base">{index + 1}. {step}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                JobLens reads the visible job page after your click, compares it with your resume when available, and keeps the conversation grounded.
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <FeatureGrid />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold">How money and keys work.</h2>
          <p className="mt-3 text-muted-foreground">You can stay free, pay with Razorpay for Pro, or bring your own provider keys.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Mic2, "Free", "Fast & Free Voice and limited platform usage."],
            [CreditCard, "Pro", "₹400/month or ₹4000/year through Razorpay Orders."],
            [KeyRound, "BYOK", "Use your own TypeGPT, Gemini, and LiveKit credentials. Keys are encrypted."],
          ].map(([Icon, title, text]) => {
            const IconComponent = Icon as typeof ShieldCheck;
            return (
              <Card key={String(title)}>
                <CardHeader>
                  <IconComponent className="h-5 w-5 text-primary" />
                  <CardTitle>{String(title)}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{String(text)}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-semibold">Choose the voice mode that fits the moment.</h2>
          <p className="mt-3 text-muted-foreground">Fast & Free uses browser voice. Natural Call uses LiveKit and Gemini Live when available.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Fast & Free Voice</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Free browser speech recognition and speech synthesis. No LiveKit or Gemini key required.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Natural Call Voice</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Realtime call-like conversation using Gemini Live through a LiveKit agent.</CardContent>
          </Card>
        </div>
      </section>
      <section className="border-y bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">Start free, upgrade when natural voice matters.</h2>
              <p className="mt-3 text-muted-foreground">Bring your own keys any time from voice settings.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/pricing">Full pricing <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <PricingTable compact />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-3xl font-semibold">Install JobLens Voice</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Load the private beta extension, sign in, and click the floating button on any job posting.</p>
          <Button asChild className="mt-6">
            <Link href="/install-extension">Install the extension</Link>
          </Button>
        </div>
      </section>
    </MarketingPage>
  );
}
