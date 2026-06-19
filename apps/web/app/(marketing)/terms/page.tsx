import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Terms of service</h1>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <p>JobLens Recruiter AI provides job analysis, candidate parsing, multi-signal ranking, and explainable shortlisting for recruiter-side review.</p>
          <p>Rankings are decision-support outputs only. Users are responsible for reviewing candidate evidence, complying with hiring laws, and avoiding use of protected attributes in hiring decisions.</p>
          <p>Bring-your-own-key credentials are used only to fulfill user-requested model calls and are encrypted at rest.</p>
        </div>
      </main>
    </MarketingPage>
  );
}
