import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterRankingsPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Recruiter Rankings</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>Generate explainable ranked shortlists from the recruiter dashboard. Ranking is decision support only and requires human review.</p>
        <Button asChild><Link href="/dashboard/recruiter">Open ranking workspace</Link></Button>
      </CardContent>
    </Card>
  );
}
