const quotes = [
  ["Aisha R.", "Final-year CS student", "Resume tailoring, voice Q&A", "JobLens caught that the role wanted accessibility work before I applied. I fixed my project bullets and felt much clearer."],
  ["Dev K.", "Frontend developer", "Missing skills check", "The voice Q&A helped me decide if a posting was worth a full application while I was commuting."]
];

export function TestimonialSpotlight() {
  return (
    <section className="bg-panel-dark py-20 text-panel-dark-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">What users say</p>
        <h2 className="mt-3 font-display text-4xl font-bold">From job search to job offer.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {quotes.map(([name, role, tag, quote], index) => (
            <article key={name} className={`rounded-2xl p-6 ${index === 0 ? "bg-accent text-accent-foreground" : "border border-white/10 bg-card/10"}`}>
              <p className="text-lg leading-8">{quote}</p>
              <div className="mt-6">
                <p className="font-bold">{name}</p>
                <p className={index === 0 ? "text-accent-foreground/70" : "text-panel-dark-muted"}>{role}</p>
                <p className="mt-3 inline-flex rounded-full border border-current/20 px-3 py-1 text-sm">{tag}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
