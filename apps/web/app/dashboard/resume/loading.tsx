import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Card><CardContent className="p-6"><Skeleton className="h-20" /></CardContent></Card>
      <Skeleton className="h-40" />
    </div>
  );
}
