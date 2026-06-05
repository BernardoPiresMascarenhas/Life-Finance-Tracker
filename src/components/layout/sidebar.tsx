import { PiggyBank } from "lucide-react";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <PiggyBank className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Finance Tracker
        </span>
      </div>
      <div className="flex-1 py-4">
        <NavLinks />
      </div>
    </aside>
  );
}
