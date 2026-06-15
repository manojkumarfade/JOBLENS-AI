import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Terms of service</h1>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <p>JobLens Voice provides job analysis, resume comparison, and truthful tailoring suggestions. It does not auto-apply to jobs or submit forms.</p>
          <p>Users are responsible for verifying job details, provider usage costs, and application materials before submitting anything outside JobLens Voice.</p>
          <p>Bring-your-own-key credentials are used only to fulfill user-requested model calls and are encrypted at rest.</p>
        </div>
      </main>
    </MarketingPage>
  );
}
