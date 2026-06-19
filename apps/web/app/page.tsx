import Link from "next/link";
import { ArrowRight, BrainCircuit, FileSearch, ListChecks, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { MarketingPage } from "@/components/marketing/MarketingShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Deep Job Understanding",
    text: "Extract seniority, responsibilities, must-have skills, domain knowledge, disqualifiers, and role-specific scoring weights.",
    icon: BrainCircuit
  },
  {
    title: "Semantic Candidate Matching",
    text: "Compare candidates by meaning and evidence, not only by exact keyword overlap.",
    icon: FileSearch
  },
  {
    title: "Multi-Signal Scoring",
    text: "Blend semantic fit, must-have coverage, experience, projects, career metadata, and synthetic activity signals.",
    icon: SlidersHorizontal
  },
  {
    title: "Explainable Ranking",
    text: "Generate a ranked shortlist with score breakdowns, matched evidence, gaps, concerns, and interview questions.",
    icon: ListChecks
  },
  {
    title: "Human-in-the-loop Review",
    text: "Keep recruiters in control with fairness notes, no protected-attribute scoring, and no automatic rejection decisions.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <MarketingPage showVoiceDemo={false}>
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary" className="w-fit">JobLens Recruiter AI</Badge>
            <div className="space-y-5">
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-normal md:text-6xl">
                AI Recruiter That Ranks Candidates, Not Just Filters Resumes
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                JobLens Recruiter AI understands nuanced job descriptions, compares candidates semantically, integrates career and activity signals, and produces an explainable ranked shortlist.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
                <Link href="/dashboard/recruiter">
                  Try Recruiter Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Senior Full Stack Developer / AI Product Engineer</p>
                  <p className="text-xs text-muted-foreground">Ranked shortlist · demo candidate pool</p>
                </div>
                <Badge>92% Avg</Badge>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["#1", "Aarav Menon", "Excellent Fit", 94],
                  ["#2", "Sameer Kulkarni", "Strong Fit", 78],
                  ["#3", "Riya Kapoor", "Moderate Fit", 66]
                ].map(([rank, name, label, score]) => (
                  <div key={String(name)} className="rounded-md border bg-background p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{rank} {name}</p>
                        <p className="text-xs text-muted-foreground">{label} · evidence-based explanation ready</p>
                      </div>
                      <p className="font-display text-xl font-bold">{score}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-muted-foreground">Proof of Concept</p>
              <h2 className="mt-3 font-display text-4xl font-bold">Built for recruiter-side shortlisting.</h2>
              <p className="mt-4 text-muted-foreground">
                The MVP parses a job, parses candidate profiles, ranks them with multiple signals, and explains the shortlist so a recruiter can review the evidence quickly.
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
                <h2 className="font-display text-3xl font-bold">From job description to ranked shortlist in one flow.</h2>
                <p className="mt-3 max-w-2xl text-panel-dark-muted">
                  Demo data is included, AI calls gracefully fall back to deterministic ranking, and every recommendation includes human-review wording.
                </p>
              </div>
              <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/85">
                <Link href="/dashboard/recruiter">Open Recruiter Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingPage>
  );
}
