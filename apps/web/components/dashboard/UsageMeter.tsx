import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UsageMeter({ used, limit, plan }: { used: number; limit: number | null; plan?: string | null }) {
  if (limit == null || plan === "byok") {
    return (
      <Card>
        <CardHeader><CardTitle>Usage</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">BYOK usage is unlimited on the JobLens side and billed by your provider.</p>
        </CardContent>
      </Card>
    );
  }

  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <Card>
      <CardHeader><CardTitle>Usage</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between text-sm">
          <span>{used} analyses this month</span>
          <span>{limit} limit</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
