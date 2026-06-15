import { CheckCircle2 } from "lucide-react";

type FeatureSectionProps = {
  eyebrow: string;
  title: string;
  body: string;
  bullet: string;
  reverse?: boolean;
  art: "requirements" | "matches" | "bullets";
};

export function FeatureSection({ eyebrow, title, body, bullet, reverse = false, art }: FeatureSectionProps) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center">
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight">{title}</h2>
        <p className="mt-5 text-base leading-7 text-muted-foreground">{body}</p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 text-primary" /> {bullet}
        </p>
      </div>
      <FeatureArt art={art} />
    </section>
  );
}

function FeatureArt({ art }: { art: FeatureSectionProps["art"] }) {
  const content = {
    requirements: ["Own React dashboard workflows", "Design API contracts with backend teams", "Improve accessibility and performance"],
    matches: ["React dashboards", "Node.js APIs", "Design system ownership"],
    bullets: ["Led dashboard refresh that cut review time by 35%", "Built reusable React workflow components", "Partnered with product on accessibility fixes"]
  }[art];

  const background = art === "matches" ? "url('/generated/joblens-gradient-clay.png')" : "url('/generated/joblens-gradient-sage.png')";

  return (
    <div className="rounded-2xl border bg-cover p-4 shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)]" style={{ backgroundImage: background }}>
      <div className="rounded-2xl border bg-card/82 p-5 backdrop-blur">
        <p className="text-sm font-bold text-muted-foreground">{art === "bullets" ? "Tailored bullets" : art === "matches" ? "Strong matches" : "Requirements"}</p>
        <div className="mt-4 grid gap-3">
          {content.map((item) => (
            <div key={item} className="rounded-xl border bg-background/80 p-3 text-sm">{item}</div>
          ))}
        </div>
        {art === "bullets" ? <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">Suggestions never invent experience.</p> : null}
      </div>
    </div>
  );
}
