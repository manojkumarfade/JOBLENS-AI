import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterCandidatesPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Recruiter Candidate Pool</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>Upload or add recruiter candidate profiles inside the ranking workspace. These are separate from a user&apos;s personal resume.</p>
        <Button asChild><Link href="/dashboard/recruiter">Open ranking workspace</Link></Button>
      </CardContent>
    </Card>
  );
}
