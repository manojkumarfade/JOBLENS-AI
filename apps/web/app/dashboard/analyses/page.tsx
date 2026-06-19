import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AnalysesClient } from "@/components/dashboard/AnalysesClient";
import { getRoleForUser } from "@/lib/auth/roles";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function AnalysesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  const role = await getRoleForUser(user.id);
  if (role !== "candidate") redirect("/dashboard/recruiter");
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
