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
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email; // 👈 Pegamos o e-mail

  if (!userId) {
    redirect("/login");
  }

  // 👇 Verificamos se é a sua conta de administrador
  const isAdmin = userEmail === "bernardomasca3008@gmail.com";

  // últimos 12 meses de transações para o fluxo de caixa
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
      {/* 👇 Grid dinâmico: 4 colunas pra você, 3 colunas para os clientes */}
      <div className={`grid gap-3 grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
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
        
        {/* 👇 O Card do Poker só é renderizado na tela se for você */}
        {isAdmin && (
          <Metric
            icon={<Spade className="h-4 w-4" />}
            label="Bankroll (poker)"
            value={formatBRL(bankroll)}
            accent={bankroll >= 0 ? "text-emerald-500" : "text-destructive"}
          />
        )}

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