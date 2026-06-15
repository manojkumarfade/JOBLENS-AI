import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-52" />
    </div>
  );
}
