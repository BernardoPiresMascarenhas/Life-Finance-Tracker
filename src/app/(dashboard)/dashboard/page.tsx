import { redirect } from "next/navigation";
import { auth } from "@/auth"; // 👈 Importamos a autenticação
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
  // 👇 1. Pega o ID do usuário logado
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // últimos 12 meses de transações para o fluxo de caixa
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [cashBalance, receivables, bankroll, lastSnapshot, transactions] =
    await Promise.all([
      // 👇 Passamos o userId para as funções de métricas calcularem certo
      getCashBalance(userId),
      getReceivables(userId),
      getPokerBankroll(userId),
      // 👇 Filtramos o patrimônio para ser só do usuário
      prisma.netWorthSnapshot.findFirst({ 
        where: { userId: userId },
        orderBy: { date: "desc" } 
      }),
      // 👇 Filtramos o gráfico para mostrar só as transações do usuário
      prisma.transaction.findMany({
        where: { 
          userId: userId, 
          date: { gte: since } 
        },
        select: { type: true, amount: true, date: true },
      }),
    ]);

  // agrupa por mês (12 buckets em ordem)
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={<Wallet className="h-4 w-4" />}
          label="Saldo em caixa"
          value={formatBRL(cashBalance)}
          accent={cashBalance >= 0 ? "text-emerald-500" : "text-destructive"}
        />
        <Metric
          icon={<Clock className="h-4 w-4" />}
          label="A receber"
          value={formatBRL(receivables)}
          accent="text-amber-500"
        />
        <Metric
          icon={<Spade className="h-4 w-4" />}
          label="Bankroll (poker)"
          value={formatBRL(bankroll)}
          accent={bankroll >= 0 ? "text-emerald-500" : "text-destructive"}
        />
        <Metric
          icon={<TrendingUp className="h-4 w-4" />}
          label="Patrimônio"
          value={patrimonio === null ? "—" : formatBRL(patrimonio)}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fluxo de caixa — últimos 12 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CashflowChart data={cashflow} />
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <p className="text-sm">{label}</p>
        </div>
        <p className={`mt-2 text-xl font-semibold tabular-nums ${accent ?? ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}