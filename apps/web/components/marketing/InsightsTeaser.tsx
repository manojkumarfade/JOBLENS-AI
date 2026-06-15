const insights = [
  ["How to read a job post in five minutes", "Separate requirements from nice-to-have signals before you apply."],
  ["Resume evidence beats keyword stuffing", "Use specific proof when adapting bullets for a role."],
  ["When a gap is worth fixing", "Decide which missing skills matter now and which can wait."]
];

export function InsightsTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Insights</p>
        <h2 className="mt-3 font-display text-4xl font-bold">Sharper habits for better applications.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {insights.map(([title, text]) => (
          <article key={title} className="rounded-2xl border bg-card p-5 shadow-[0_20px_60px_-30px_rgba(20,40,30,0.35)]">
            <h3 className="font-display text-xl font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
