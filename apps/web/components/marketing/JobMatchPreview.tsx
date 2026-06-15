import { Home, ListChecks, Mic, Settings, UserRound } from "lucide-react";

const stats = [
  ["Match Score", "92%"],
  ["Skills Matched", "8/10"],
  ["Resume Tailored", "Yes"]
];

const segments = [
  ["Frontend", "32%", "bg-accent"],
  ["Backend", "26%", "bg-primary"],
  ["Tools", "24%", "bg-muted-foreground"],
  ["Soft Skills", "18%", "bg-muted"]
];

export function JobMatchPreview({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "mx-auto max-w-6xl px-4 py-10"}>
      <div className="grid overflow-hidden rounded-2xl border bg-card shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)] md:grid-cols-[76px_1fr]">
        <div className="hidden border-r bg-muted/60 p-4 md:grid md:content-start md:gap-4">
          {[Home, ListChecks, Settings, UserRound].map((Icon, index) => (
            <span key={index} className="grid h-11 w-11 place-items-center rounded-xl bg-card text-muted-foreground">
              <Icon className="h-5 w-5" />
            </span>
          ))}
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">Job Match Overview</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Updated just now</span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-background p-4">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex h-5 overflow-hidden rounded-full bg-muted">
              {segments.map(([label, width, color]) => (
                <div key={label} className={color} style={{ width }} title={label} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {segments.map(([label, width]) => <span key={label}>{label} {width}</span>)}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {["GraphQL", "Accessibility", "Design systems", "Stakeholder updates"].map((skill) => (
              <span key={skill} className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{skill}</span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
              <Mic className="h-4 w-4" /> Ask JobLens
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
