import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Wallet, Clock, Spade, TrendingUp } from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  getCashBalance,
  getReceivables,
  getPokerBankroll,
} from "@/services/metrics";
import { formatBRL } from "@/lib/format";
import {
  CashflowChart,
  type CashflowPoint,
} from "@/features/dashboard/cashflow-chart";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthKeyFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
});

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId) {
    redirect("/login");
  }
  const isAdmin = userEmail === "bernardomasca3008@gmail.com";

  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [cashBalance, receivables, bankroll, lastSnapshot, transactions] =
    await Promise.all([
      getCashBalance(userId),
      getReceivables(userId),
      getPokerBankroll(userId),
      prisma.netWorthSnapshot.findFirst({
        where: { userId: userId },
        orderBy: { date: "desc" }
      }),
      prisma.transaction.findMany({
        where: {
          userId: userId,
          date: { gte: since }
        },
        select: { type: true, amount: true, date: true },
      }),
    ]);

  const buckets = new Map<string, CashflowPoint>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, {
      label: monthKeyFmt.format(d),
      receitas: 0,
      despesas: 0,
    });
  }
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (t.type === "INCOME") bucket.receitas += Number(t.amount);
    else bucket.despesas += Number(t.amount);
  }
  const cashflow = Array.from(buckets.values());

  const patrimonio = lastSnapshot ? Number(lastSnapshot.total) : null;

  return (
    // Ajuste no gap principal: um pouco menor no mobile (space-y-6) e maior no desktop (md:space-y-8)
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 p-4 md:p-8">
      
      <div className="flex flex-col gap-1">
        {/* Título responsivo */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Acompanhe suas finanças e fluxo de caixa.
        </p>
      </div>

      <div className={`grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <Metric
          icon={<Wallet className="h-5 w-5 text-blue-500" />}
          label="Saldo em caixa"
          value={formatBRL(cashBalance)}
          accent={cashBalance >= 0 ? "text-emerald-500" : "text-destructive"}
        />
        <Metric
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="A receber"
          value={formatBRL(receivables)}
          accent="text-foreground"
        />
        
        {isAdmin && (
          <Metric
            icon={<Spade className="h-5 w-5 text-purple-500" />}
            label="Bankroll (poker)"
            value={formatBRL(bankroll)}
            accent={bankroll >= 0 ? "text-emerald-500" : "text-destructive"}
          />
        )}

        <Metric
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="Patrimônio"
          value={patrimonio === null ? "—" : formatBRL(patrimonio)}
          accent="text-foreground"
        />
      </div>

      <Card className="hover:shadow-sm transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base md:text-lg font-semibold">
            Fluxo de caixa — últimos 12 meses
          </CardTitle>
        </CardHeader>
        {/* Padding interno adaptado para não espremer o gráfico no celular */}
        <CardContent className="pt-2 pb-4 px-4 md:pb-6 md:px-6">
          {/* Altura responsiva: 250px celular / 350px PC */}
          <div className="h-[250px] md:h-[350px] w-full">
            <CashflowChart data={cashflow} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      {/* P-4 no mobile para ganhar espaço, P-6 no desktop para elegância */}
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">
            {label}
          </p>
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-secondary/50">
            {icon}
          </div>
        </div>
        <div>
          {/* Texto menor no mobile para não quebrar a linha com números grandes */}
          <p className={`text-2xl md:text-3xl font-bold tracking-tight tabular-nums ${accent ?? ""}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}