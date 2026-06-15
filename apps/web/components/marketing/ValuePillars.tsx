import { FileSearch, Mic, Target } from "lucide-react";

const pillars = [
  [FileSearch, "Understand", "Extract the real role, responsibilities, and signals from dense job posts."],
  [Target, "Compare", "Match the role against resume evidence and flag gaps before you apply."],
  [Mic, "Act", "Ask follow-ups by voice and turn the answer into grounded next steps."]
];

export function ValuePillars() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-2xl">
        <h2 className="font-display text-4xl font-bold">JobLens helps you understand, compare, and act.</h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pillars.map(([Icon, title, text]) => {
          const PillarIcon = Icon as typeof FileSearch;
          return (
            <div key={String(title)} className="rounded-2xl border bg-card p-6 shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)]">
              <PillarIcon className="h-6 w-6 text-primary" />
              <h3 className="mt-5 font-display text-xl font-bold">{String(title)}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{String(text)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
