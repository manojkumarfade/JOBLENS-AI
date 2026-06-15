import { Skeleton } from "@/components/ui/skeleton";

export default function VoiceSettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-[34rem] max-w-full" />
      </div>
      <Skeleton className="h-16" />
      <Skeleton className="h-44" />
      <Skeleton className="h-56" />
      <Skeleton className="h-72" />
    </div>
  );
}
