import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-[320px] w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
