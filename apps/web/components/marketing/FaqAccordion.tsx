const categories = ["General", "Ranking", "Privacy", "Billing"];

const faqs = [
  ["What does JobLens rank?", "It ranks candidate profiles or parsed resumes against recruiter-provided job criteria using multiple evidence signals."],
  ["Does JobLens automatically reject candidates?", "No. It produces decision-support rankings and explanations for human recruiter review."],
  ["Is candidate data private?", "Candidate and resume data is stored with row-level security, only you can access it, and you can delete it from settings."],
  ["What is BYOK?", "Bring your own TypeGPT API key for unlimited usage. The key is encrypted at rest and never shown again after saving."],
  ["Does ranking use protected attributes?", "No. The ranking path is designed around job criteria, candidate evidence, and explicit fairness guardrails."]
];

export function FaqAccordion() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-20 lg:grid-cols-[260px_1fr]">
      <div>
        <h2 className="font-display text-4xl font-bold">Questions, answered.</h2>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible">
          {categories.map((category) => (
            <span key={category} className="rounded-full border bg-card px-4 py-2 text-sm font-semibold">{category}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        {faqs.map(([question, answer]) => (
          <details key={question} className="rounded-2xl border bg-card p-5">
            <summary className="cursor-pointer font-display text-lg font-bold">{question}</summary>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
