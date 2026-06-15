import { Suspense } from "react";
import { AnalysesClient } from "@/components/dashboard/AnalysesClient";

export default function AnalysesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Saved analyses</h1>
        <p className="mt-2 text-muted-foreground">Review saved roles, match scores, gaps, actions, and truthful tailored bullets.</p>
      </div>
      <Suspense fallback={<div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">Loading analyses...</div>}>
        <AnalysesClient />
      </Suspense>
    </div>
  );
}
