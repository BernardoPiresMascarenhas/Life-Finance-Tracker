import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  Spade,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

// 1. Mantemos a lista completa para o sistema reconhecer a rota do Poker
export const ALL_NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transações", href: "/transactions", icon: Wallet },
  { title: "Freelances", href: "/freelances", icon: Briefcase },
  { title: "Poker", href: "/poker", icon: Spade },
  { title: "Patrimônio", href: "/patrimonio", icon: TrendingUp },
];

// 2. Criamos uma função que filtra o menu com base no usuário logado
export function getNavItems(userEmail?: string | null): NavItem[] {
  // Se for você, retorna o menu completo com o Poker
  if (userEmail === "bernardomasca3008@gmail.com") {
    return ALL_NAV_ITEMS;
  }
  // Se for um cliente, remove o Poker da lista
  return ALL_NAV_ITEMS.filter((item) => item.href !== "/poker");
}

// 3. O titleForPath continua buscando na lista completa
export function titleForPath(pathname: string) {
  const match = ALL_NAV_ITEMS.find((i) => pathname.startsWith(i.href));
  return match?.title ?? "Life Finance Tracker";
}