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

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transações", href: "/transactions", icon: Wallet },
  { title: "Freelances", href: "/freelances", icon: Briefcase },
  { title: "Poker", href: "/poker", icon: Spade },
  { title: "Patrimônio", href: "/patrimonio", icon: TrendingUp },
];

export function titleForPath(pathname: string) {
  const match = NAV_ITEMS.find((i) => pathname.startsWith(i.href));
  return match?.title ?? "Life Finance Tracker";
}
