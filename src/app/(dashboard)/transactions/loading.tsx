import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
