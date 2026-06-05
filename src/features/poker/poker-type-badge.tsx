import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PokerType } from "./types";

const MAP: Record<PokerType, { label: string; className: string }> = {
  CASH: {
    label: "Cash Game",
    className: "border-transparent bg-emerald-500/15 text-emerald-500",
  },
  TOURNAMENT: {
    label: "Torneio",
    className: "border-transparent bg-violet-500/15 text-violet-500",
  },
  SITNGO: {
    label: "Sit & Go",
    className: "border-transparent bg-sky-500/15 text-sky-500",
  },
};

export const POKER_TYPE_OPTIONS = (Object.keys(MAP) as PokerType[]).map(
  (value) => ({ value, label: MAP[value].label })
);

export function PokerTypeBadge({ type }: { type: PokerType }) {
  const { label, className } = MAP[type];
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {label}
    </Badge>
  );
}
