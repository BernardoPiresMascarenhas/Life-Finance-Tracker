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
    // 👇 Espaçamento dinâmico: space-y-6 no mobile, space-y-8 no PC
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 p-4 md:p-8">
      
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          {/* 👇 Fontes adaptáveis */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas receitas e despesas do mês.
          </p>
        </div>
        
        {/* Filtro e Botão alinhados e ajustáveis no mobile */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <MonthFilter defaultMonth={currentMonth()} />
          </div>
          <TransactionDialog>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nova transação</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </DialogTrigger>
          </TransactionDialog>
        </div>
      </div>

      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-3">
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

// 👇 Componente ajustado com padding, ícones e fontes responsivas
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
          <p className={`text-2xl md:text-3xl font-bold tracking-tight tabular-nums ${accent}`}>
            {formatBRL(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}