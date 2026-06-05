import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "./types";

const MAP: Record<ProjectStatus, { label: string; className: string }> = {
  IN_PROGRESS: {
    label: "Em andamento",
    className: "border-transparent bg-blue-500/15 text-blue-500",
  },
  DONE: {
    label: "Concluído",
    className: "border-transparent bg-emerald-500/15 text-emerald-500",
  },
  PAUSED: {
    label: "Pausado",
    className: "border-transparent bg-amber-500/15 text-amber-500",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "border-transparent bg-muted text-muted-foreground",
  },
};

export const STATUS_OPTIONS = (
  Object.keys(MAP) as ProjectStatus[]
).map((value) => ({ value, label: MAP[value].label }));

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = MAP[status];
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {label}
    </Badge>
  );
}
