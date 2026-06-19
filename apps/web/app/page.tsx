import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Chrome, FileCheck2, LockKeyhole, Mic2, Sparkles } from "lucide-react";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Browser Voice Copilot",
    text: "Open any normal webpage, click the floating extension button, ask by voice, and hear a clear spoken answer.",
    icon: Mic2
  },
  {
    title: "Candidate Resume Fit Analysis",
    text: "Upload your resume once, then ask job-fit questions on job boards without mixing your personal resume with recruiter pools.",
    icon: FileCheck2
  },
  {
    title: "Recruiter Candidate Ranking",
    text: "Recruiters can enter a job description, compare candidate profiles, and generate an explainable ranked shortlist.",
    icon: BriefcaseBusiness
  },
  {
    title: "Privacy-first DOM Extraction",
    text: "The extension sends visible page text only after you click the voice button, and temporary live transcript text is not stored by default.",
    icon: LockKeyhole
  },
  {
    title: "Free Browser Voice Mode",
    text: "Voice input uses the browser Web Speech API and spoken replies use browser speechSynthesis. No paid TTS stack is required.",
    icon: Chrome
  }
];

export default function HomePage() {
  return (
    <MarketingPage showVoiceDemo={false}>
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary" className="w-fit">JobLens AI Browser Copilot</Badge>
            <div className="space-y-5">
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-normal md:text-6xl">
                Summarize any webpage by voice, then go deeper on jobs and candidates.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                JobLens AI Browser Copilot summarizes any webpage by voice, analyzes job descriptions with your resume, and includes recruiter AI tools for candidate ranking and shortlisting.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
                <Link href="/login">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/dashboard/recruiter">Open Recruiter Demo</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Browser Copilot session</p>
                  <p className="text-xs text-muted-foreground">Visible page text is read after click</p>
                </div>
                <Badge>Web Voice</Badge>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["You", "Summarize this page.", "Listening"],
                  ["JobLens", "This page explains how the product works and the main actions you can take next.", "Speaking"],
                  ["You", "Am I fit for this job?", "Resume-aware"]
                ].map(([speaker, text, label]) => (
                  <div key={`${speaker}-${text}`} className="rounded-md border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">{speaker}</p>
                        <p className="mt-1 text-sm font-medium">{text}</p>
                      </div>
                      <Badge variant="secondary">{label}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-panel-dark p-4 text-panel-dark-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold">Recruiter AI module included</p>
                </div>
                <p className="mt-2 text-sm text-panel-dark-muted">
                  Rank demo candidates with multi-signal scoring, explainable breakdowns, and human-review guardrails.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-muted-foreground">One product, two workflows</p>
              <h2 className="mt-3 font-display text-4xl font-bold">Voice-first browsing for users. Ranking tools for recruiters.</h2>
              <p className="mt-4 text-muted-foreground">
                Start as a candidate or general user by connecting the extension and uploading a resume. Recruiter AI remains available as a separate module in the same account.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.title}>
                    <CardContent className="p-5">
                      <Icon className="h-6 w-6 text-primary" />
                      <h3 className="mt-5 font-display text-xl font-bold">{section.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-lg bg-panel-dark p-8 text-panel-dark-foreground md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="font-display text-3xl font-bold">Install the extension, open a page, and ask out loud.</h2>
                <p className="mt-3 max-w-2xl text-panel-dark-muted">
                  General summaries work without a resume. Job-fit analysis uses your active resume when you have one. Recruiter ranking stays available from the dashboard.
                </p>
              </div>
              <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
                <Link href="/dashboard/candidate">Open Browser Copilot Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingPage>
  );
}
