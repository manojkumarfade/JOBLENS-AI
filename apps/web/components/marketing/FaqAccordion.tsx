const categories = ["General", "Voice", "Privacy", "Billing"];

const faqs = [
  ["What does JobLens actually read from a job page?", "Only the visible text after you click the floating button; nothing is read automatically."],
  ["How does the voice assistant work?", "It uses browser speech recognition and speech synthesis. There is no call or telephony layer involved."],
  ["Is my resume data private?", "Resume data is stored with row-level security, only you can access it, and you can delete it from settings."],
  ["What is BYOK?", "Bring your own TypeGPT API key for unlimited usage. The key is encrypted at rest and never shown again after saving."],
  ["Can JobLens apply to jobs for me?", "No. JobLens helps you understand and prepare; you stay in control of every application."]
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
