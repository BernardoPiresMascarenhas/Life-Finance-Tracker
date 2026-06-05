import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-24 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-[320px] w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
