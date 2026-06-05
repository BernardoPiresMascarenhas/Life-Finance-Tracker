import { PiggyBank } from "lucide-react"; // Troquei para Wallet para combinar com um sistema financeiro
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    // 👇 Aumentei de w-60 para w-72 (deixa o menu lateral mais largo e imponente)
    <aside className="hidden w-72 shrink-0 border-r bg-sidebar md:flex md:flex-col shadow-sm">
      {/* 👇 Aumentei a altura do cabeçalho (h-16) e o padding */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
          <PiggyBank className="h-5 w-5" />
        </div>
        <span className="text-base font-bold tracking-tight">
          Finance Tracker
        </span>
      </div>
      
      {/* 👇 Mais espaço em branco no topo antes de começar a lista de links */}
      <div className="flex-1 py-6">
        <NavLinks />
      </div>
    </aside>
  );
}



