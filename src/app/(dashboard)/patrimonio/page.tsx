import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus, TrendingUp, Landmark } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getReceivables, getPokerBankroll } from "@/services/metrics";
import { formatBRL } from "@/lib/format";
import type { SnapshotRow, NetWorthPoint } from "@/features/networth/types";
import { SnapshotDialog } from "@/features/networth/snapshot-dialog";
import { SnapshotsTable } from "@/features/networth/snapshots-table";
import { NetWorthChart } from "@/features/networth/networth-chart";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthLabel = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
});

export default async function PatrimonioPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [snapshotsAsc, receivables, bankroll] = await Promise.all([
    prisma.netWorthSnapshot.findMany({ 
      where: { userId: userId }, 
      orderBy: { date: "asc" } 
    }),
    getReceivables(userId), 
    getPokerBankroll(userId), 
  ]);

  const asc: SnapshotRow[] = snapshotsAsc.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    checkingAccount: Number(s.checkingAccount),
    investments: Number(s.investments),
    crypto: Number(s.crypto),
    otherAssets: Number(s.otherAssets),
    receivables: Number(s.receivables),
    pokerBankroll: Number(s.pokerBankroll),
    total: Number(s.total),
    note: s.note,
  }));

  const chartData: NetWorthPoint[] = asc.map((s) => ({
    label: monthLabel.format(new Date(s.date)),
    total: s.total,
  }));

  const rows = [...asc].reverse();
  const hasData = asc.length > 0;

  const current = hasData ? asc[asc.length - 1].total : null;
  const previous = asc.length > 1 ? asc[asc.length - 2].total : null;
  const delta =
    current !== null && previous !== null ? current - previous : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 p-4 md:p-8">
      
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Patrimônio</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Acompanhe a evolução da sua riqueza ao longo dos meses.
          </p>
        </div>
        
        <SnapshotDialog prefillReceivables={receivables} prefillBankroll={bankroll}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Novo snapshot
            </Button>
          </DialogTrigger>
        </SnapshotDialog>
      </div>

      {/* Grid para o Card de Resumo (pode adicionar mais cards no futuro se quiser) */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow duration-200 sm:col-span-1">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground tracking-tight">
                Patrimônio atual
              </p>
              <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-secondary/50">
                <Landmark className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
                {current === null ? "—" : formatBRL(current)}
              </p>
              {delta !== null && (
                <p
                  className={`mt-1 text-sm font-medium tabular-nums ${
                    delta >= 0 ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {delta >= 0 ? "▲" : "▼"} {formatBRL(Math.abs(delta))} vs. mês anterior
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Tabela */}
      {hasData ? (
        <div className="space-y-6 md:space-y-8">
          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg font-semibold">
                Evolução do patrimônio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-4 px-4 md:pb-6 md:px-6">
              <div className="h-[250px] md:h-[350px] w-full">
                <NetWorthChart data={chartData} />
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <SnapshotsTable rows={rows} />
          </div>
        </div>
      ) : (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/80">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">Nenhum registro ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Registre o seu primeiro snapshot (fotografia financeira) para começar o gráfico.
              </p>
            </div>
            <div className="mt-4">
              <SnapshotDialog prefillReceivables={receivables} prefillBankroll={bankroll}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Novo snapshot
                  </Button>
                </DialogTrigger>
              </SnapshotDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}