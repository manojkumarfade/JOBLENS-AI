import { MarketingPage } from "@/components/marketing/MarketingShell";

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-semibold">Privacy and data deletion</h1>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <p>JobLens AI Browser Copilot stores account profile data, personal resumes you upload, saved analyses when enabled, recruiter-provided jobs and candidate pools, recruiter ranking outputs, and encrypted BYOK credential records.</p>
          <p>Page content is read only after you click the floating JobLens extension button. Temporary live voice transcript text is not stored by default and is cleared from the extension UI after the interaction.</p>
          <p>Recruiter candidate pools are separate from a candidate/general user&apos;s personal resume. API keys are encrypted at rest and never sent back to the browser or extension after saving.</p>
          <p>Signed-in users can delete saved analyses, voice transcripts if they explicitly saved any, page contexts, resume files, credential records, or the full account from dashboard privacy controls.</p>
        </div>
      </main>
    </MarketingPage>
  );
}
