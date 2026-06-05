import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus, TrendingUp } from "lucide-react";

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
  // 👇 1. Pega o ID do usuário logado
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // 👇 2. Busca o patrimônio apenas deste usuário e passa o ID para as métricas
  const [snapshotsAsc, receivables, bankroll] = await Promise.all([
    prisma.netWorthSnapshot.findMany({ 
      where: { userId: userId }, // 👈 Filtro Mágico!
      orderBy: { date: "asc" } 
    }),
    getReceivables(userId), // 👈 Passando o ID para a função matemática
    getPokerBankroll(userId), // 👈 Passando o ID para a função matemática
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Card className="w-auto">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Patrimônio atual</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {current === null ? "—" : formatBRL(current)}
            </p>
            {delta !== null && (
              <p
                className={`text-xs tabular-nums ${
                  delta >= 0 ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {delta >= 0 ? "▲" : "▼"} {formatBRL(Math.abs(delta))} vs. anterior
              </p>
            )}
          </CardContent>
        </Card>

        <SnapshotDialog
          prefillReceivables={receivables}
          prefillBankroll={bankroll}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo snapshot
            </Button>
          </DialogTrigger>
        </SnapshotDialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Evolução do patrimônio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <NetWorthChart data={chartData} />
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Registre seu primeiro snapshot ao fim do mês.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {hasData && <SnapshotsTable rows={rows} />}
    </div>
  );
}