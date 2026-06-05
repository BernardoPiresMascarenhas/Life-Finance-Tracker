"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // 👈 Nova importação
import { cn } from "@/lib/utils";
import { getNavItems } from "./nav-config"; // 👈 Trocamos NAV_ITEMS por getNavItems

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession(); // 👈 Pega os dados do usuário logado

  // 👈 Gera a lista de links permitidos passando o e-mail atual
  const navItems = getNavItems(session?.user?.email); 

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}