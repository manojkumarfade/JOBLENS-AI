import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Terms of service</h1>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <p>JobLens AI Browser Copilot provides browser voice assistance for webpage summarization, job-page explanation, resume-aware job-fit analysis, and optional recruiter candidate ranking tools.</p>
          <p>AI outputs are assistance only. Recruiter rankings are decision-support outputs, not final hiring decisions. Users are responsible for reviewing evidence, complying with applicable laws, and avoiding use of protected attributes in hiring decisions.</p>
          <p>Bring-your-own-key credentials are used only to fulfill user-requested model calls and are encrypted at rest.</p>
        </div>
      </main>
    </MarketingPage>
  );
}
