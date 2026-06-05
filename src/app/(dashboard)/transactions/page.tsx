import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus, Wallet } from "lucide-react";

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
  // 👇 1. Pega o ID do usuário logado
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();
  const { from, to } = monthRange(month);

  // 👇 2. Busca as transações filtrando pela DATA e pelo DONO
  const transactions = await prisma.transaction.findMany({
    where: { 
      userId: userId, // 👈 O Filtro Mágico Final!
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Receitas" value={income} accent="text-emerald-500" />
        <SummaryCard label="Despesas" value={expense} />
        <SummaryCard
          label="Saldo do mês"
          value={balance}
          accent={balance >= 0 ? "text-emerald-500" : "text-destructive"}
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhuma transação neste mês</p>
              <p className="text-sm text-muted-foreground">
                Adicione sua primeira receita ou despesa.
              </p>
            </div>
            <TransactionDialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova transação
                </Button>
              </DialogTrigger>
            </TransactionDialog>
          </CardContent>
        </Card>
      ) : (
        <TransactionsTable rows={rows} />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent}`}>
          {formatBRL(value)}
        </p>
      </CardContent>
    </Card>
  );
}