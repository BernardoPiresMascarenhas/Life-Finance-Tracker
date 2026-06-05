"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function MonthFilter({ defaultMonth }: { defaultMonth: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("month") ?? defaultMonth;

  return (
    <input
      type="month"
      value={current}
      onChange={(e) => {
        const sp = new URLSearchParams(params.toString());
        sp.set("month", e.target.value);
        router.push(`/transactions?${sp.toString()}`);
      }}
      className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    />
  );
}
