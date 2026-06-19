import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Privacy and data deletion</h1>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <p>JobLens Recruiter AI stores recruiter-provided jobs, parsed candidate resumes, candidate ranking outputs, saved analyses, legacy voice transcripts when used, and encrypted BYOK credential records.</p>
          <p>Page content is read only after you click the floating JobLens button. API keys are encrypted at rest and never sent back to the browser or extension after saving.</p>
          <p>Signed-in users can delete saved analyses, voice transcripts, page contexts, resume files, credential records, or the full account from the dashboard privacy controls.</p>
        </div>
      </main>
    </MarketingPage>
  );
}
