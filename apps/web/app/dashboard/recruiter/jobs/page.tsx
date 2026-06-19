import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterJobsPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Recruiter Jobs</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>Create or analyze a job description in the recruiter ranking workspace.</p>
        <Button asChild><Link href="/dashboard/recruiter">Open ranking workspace</Link></Button>
      </CardContent>
    </Card>
  );
}
