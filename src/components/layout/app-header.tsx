"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Spade, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLinks } from "./nav-links";
import { titleForPath } from "./nav-config";
import { logoutAction } from "@/actions/auth";

export function AppHeader({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-2">
        {/* Trigger mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SheetHeader className="h-14 flex-row items-center gap-2 border-b px-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Spade className="h-4 w-4" />
              </div>
              <SheetTitle className="text-sm font-semibold">
                Finance Tracker
              </SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-base font-semibold tracking-tight">
          {titleForPath(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {userLabel}
        </span>
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" type="submit">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
