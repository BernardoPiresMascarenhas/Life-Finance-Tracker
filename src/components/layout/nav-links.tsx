"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getNavItems } from "./nav-config";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = getNavItems(session?.user?.email);

  return (
    <nav className="flex flex-col gap-2 px-4">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              // 👇 Aumentamos padding, deixamos os cantos mais redondos e adicionamos animação
              "group flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
              active
                ? "bg-secondary text-foreground shadow-sm ring-1 ring-border/50" // Destaque maior para o item ativo
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:translate-x-1" // Efeito de deslizar no hover
            )}
          >
            <Icon 
              // 👇 Aumentamos o ícone de h-4 para h-5
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} 
            />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}