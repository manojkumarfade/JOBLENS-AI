import { Suspense } from "react";
import { AnalysesClient } from "@/components/dashboard/AnalysesClient";

export default function CandidateHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Browser Copilot History</h1>
        <p className="mt-2 text-muted-foreground">Review saved page summaries and job-fit analyses. Temporary voice transcripts are not saved by default.</p>
      </div>
      <Suspense fallback={<div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">Loading history...</div>}>
        <AnalysesClient />
      </Suspense>
    </div>
  );
}
