import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-44" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
