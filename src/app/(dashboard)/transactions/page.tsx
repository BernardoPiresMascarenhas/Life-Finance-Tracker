import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign 
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatBRL, monthRange, currentMonth } from "@/lib/format";
import type { TransactionRow } from "@/features/transactions/types";
import { TransactionsTable } from "@/features/transactions/transactions-table";
import { TransactionDialog } from "@/features/transactions/transaction-dialog";
import { MonthFilter } from "@/features/transactions/month-filter";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();
  const { from, to } = monthRange(month);

  const transactions = await prisma.transaction.findMany({
    where: { 
      userId: userId,
      date: { gte: from, lte: to } 
    },
    orderBy: { date: "desc" },
  });

  const rows: TransactionRow[] = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    source: t.source,
    category: t.category,
    title: t.title,
    amount: Number(t.amount),
    date: t.date.toISOString(),
    note: t.note,
  }));

  const income = rows
    .filter((r) => r.type === "INCOME")
    .reduce((s, r) => s + r.amount, 0);
  const expense = rows
    .filter((r) => r.type === "EXPENSE")
    .reduce((s, r) => s + r.amount, 0);
  const balance = income - expense;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      
      {/* 👇 Cabeçalho no mesmo padrão do Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas do mês.
          </p>
        </div>
        
        {/* Filtro e Botão alinhados lado a lado */}
        <div className="flex items-center gap-3">
          <MonthFilter defaultMonth={currentMonth()} />
          <TransactionDialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova transação
              </Button>
            </DialogTrigger>
          </TransactionDialog>
        </div>
      </div>

      {/* 👇 Cards atualizados com a mesma estrutura premium */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
        <SummaryCard 
          label="Receitas" 
          value={income} 
          accent="text-emerald-500"
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
        />
        <SummaryCard 
          label="Despesas" 
          value={expense}
          accent="text-destructive"
          icon={<TrendingDown className="h-5 w-5 text-destructive" />} 
        />
        <SummaryCard
          label="Saldo do mês"
          value={balance}
          accent={balance >= 0 ? "text-emerald-500" : "text-destructive"}
          icon={<DollarSign className="h-5 w-5 text-blue-500" />}
        />
      </div>

      {/* Tabela ou Estado Vazio */}
      {rows.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/80">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">Nenhuma transação neste mês</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione sua primeira receita ou despesa clicando no botão abaixo.
              </p>
            </div>
            <div className="mt-4">
              <TransactionDialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova transação
                  </Button>
                </DialogTrigger>
              </TransactionDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <TransactionsTable rows={rows} />
        </div>
      )}
    </div>
  );
}

// 👇 O componente de Card foi totalmente reescrito para combinar com a "Metric" do Dashboard
function SummaryCard({
  label,
  value,
  icon,
  accent = "text-foreground",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">
            {label}
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50">
            {icon}
          </div>
        </div>
        <div>
          <p className={`text-3xl font-bold tracking-tight tabular-nums ${accent}`}>
            {formatBRL(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}