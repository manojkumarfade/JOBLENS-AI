import { Badge } from "@/components/ui/badge";

const rows = [
  ["Frontend Engineer", "Northstar Labs", "92", "Apply"],
  ["Product Engineer", "BrightPath", "78", "Maybe"],
  ["Platform Intern", "OrbitStack", "54", "Skip"]
];

export function DashboardShowcase() {
  return (
    <section className="bg-panel-dark pb-20 text-panel-dark-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">Built for Clarity</span>
          <h2 className="mt-5 font-display text-4xl font-bold">Your job search, finally organized.</h2>
          <p className="mt-4 text-panel-dark-muted">Saved analyses stay scannable so you can compare roles instead of re-reading tabs.</p>
        </div>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
          <div className="grid gap-3">
            {rows.map(([role, company, score, decision]) => (
              <div key={role} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{role}</p>
                  <p className="text-sm text-panel-dark-muted">{company}</p>
                </div>
                <Badge className="w-fit bg-accent text-accent-foreground">Match {score}%</Badge>
                <Badge variant="secondary" className="w-fit">{decision}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
