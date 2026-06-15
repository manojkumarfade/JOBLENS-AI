import { Archive, FileSearch, ListChecks, Mic, PencilLine, Target } from "lucide-react";

const tiles = [
  [FileSearch, "Smart Summary", "Reads the job description and pulls out role, responsibilities, requirements"],
  [Target, "Resume Sync", "Compares against your uploaded resume"],
  [Mic, "Voice Q&A", "Ask follow-up questions out loud"],
  [ListChecks, "Missing Skills", "Flags gaps before you apply"],
  [PencilLine, "Tailored Bullets", "Truthful resume rewrite suggestions"],
  [Archive, "Saved Analyses", "Every job you checked, in one dashboard"]
];

export function FeatureTilesDark() {
  return (
    <section className="bg-panel-dark bg-cover py-20 text-panel-dark-foreground" style={{ backgroundImage: "url('/generated/joblens-dashboard-dark-bg.png')" }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">AI-Powered, Voice-First</span>
          <h2 className="mt-5 font-display text-4xl font-bold">One click. Full job clarity.</h2>
          <p className="mt-4 text-panel-dark-muted">Summaries, comparisons, missing skills, and tailored bullets - all from the page you are already on.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map(([Icon, label, text], index) => {
            const TileIcon = Icon as typeof FileSearch;
            return (
              <div key={String(label)} className={`rounded-2xl border border-white/10 p-5 ${index % 2 ? "bg-white/[0.03]" : "bg-white/5"}`}>
                <TileIcon className="h-6 w-6 text-accent" />
                <h3 className="mt-5 font-display text-xl font-bold">{String(label)}</h3>
                <p className="mt-3 text-sm leading-6 text-panel-dark-muted">{String(text)}</p>
                <div className="mt-5 h-20 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-panel-dark-muted">
                  <div className="h-2 w-2/3 rounded bg-white/20" />
                  <div className="mt-3 h-2 w-5/6 rounded bg-white/10" />
                  <div className="mt-3 h-2 w-1/2 rounded bg-accent/60" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
