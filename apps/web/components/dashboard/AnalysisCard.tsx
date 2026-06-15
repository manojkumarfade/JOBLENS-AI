import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AnalysisView {
  id: string;
  roleTitle?: string | null;
  companyName?: string | null;
  summary?: string | null;
  matchScore?: number | null;
  applyRecommendation?: string | null;
  strongMatches?: string[];
  missingSkills?: string[];
  recommendedActions?: string[];
  tailoredBullets?: string[];
}

export function AnalysisCard({ analysis }: { analysis: AnalysisView }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{analysis.roleTitle ?? "Untitled role"}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{analysis.companyName ?? "Unknown company"}</p>
        </div>
        {analysis.applyRecommendation ? <Badge variant="secondary">{analysis.applyRecommendation}</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{analysis.summary ?? "No summary saved."}</p>
        <div className="flex items-center justify-between text-sm">
          <span>Match score: {analysis.matchScore ?? "n/a"}</span>
          <Link className="text-primary" href={`/dashboard/analyses?id=${analysis.id}`}>Open</Link>
        </div>
      </CardContent>
    </Card>
  );
}
