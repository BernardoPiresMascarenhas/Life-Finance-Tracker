import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Plus, Spade } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";
import type {
  SessionRow,
  ChartPoint,
  PokerType,
} from "@/features/poker/types";
import { SessionsTable } from "@/features/poker/sessions-table";
import { SessionDialog } from "@/features/poker/session-dialog";
import { BankrollChart } from "@/features/poker/bankroll-chart";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

export default async function PokerPage() {
  // 👇 1. Pega o ID do usuário logado
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // 👇 2. Busca apenas as sessões de poker deste usuário (ordem crescente)
  const sessionsAsc = await prisma.pokerSession.findMany({
    where: { userId: userId }, // 👈 O Filtro Mágico da Banca
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const asc: SessionRow[] = sessionsAsc.map((s) => ({
    id: s.id,
    type: s.type as PokerType,
    date: s.date.toISOString(),
    location: s.location,
    buyIn: Number(s.buyIn),
    cashOut: Number(s.cashOut),
    hours: Number(s.hours),
    netResult: Number(s.netResult),
    note: s.note,
  }));

  // ───── Métricas ─────
  const totalNet = asc.reduce((sum, s) => sum + s.netResult, 0);
  const totalHours = asc.reduce((sum, s) => sum + s.hours, 0);
  const totalBuyIn = asc.reduce((sum, s) => sum + s.buyIn, 0);
  const winRate = totalHours > 0 ? totalNet / totalHours : null; // R$/hora
  const roi = totalBuyIn > 0 ? (totalNet / totalBuyIn) * 100 : null; // %

  // ───── Série acumulada da banca ─────
  let running = 0;
  const chartData: ChartPoint[] = asc.map((s) => {
    running += s.netResult;
    return { label: shortDate.format(new Date(s.date)), bankroll: running };
  });

  // tabela em ordem decrescente (mais recente primeiro)
  const rows = [...asc].reverse();
  const hasData = asc.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-end">
        <SessionDialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova sessão
            </Button>
          </DialogTrigger>
        </SessionDialog>
      </div>

      {/* Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Lucro / Prejuízo"
          value={formatBRL(totalNet)}
          accent={
            totalNet > 0
              ? "text-emerald-500"
              : totalNet < 0
                ? "text-destructive"
                : undefined
          }
        />
        <Metric
          label="Win Rate (R$/h)"
          value={winRate === null ? "—" : `${formatBRL(winRate)}/h`}
          accent={
            winRate && winRate > 0
              ? "text-emerald-500"
              : winRate && winRate < 0
                ? "text-destructive"
                : undefined
          }
        />
        <Metric
          label="ROI"
          value={roi === null ? "—" : `${roi.toFixed(1)}%`}
          accent={
            roi && roi > 0
              ? "text-emerald-500"
              : roi && roi < 0
                ? "text-destructive"
                : undefined
          }
        />
        <Metric label="Horas jogadas" value={`${totalHours.toFixed(1)}h`} />
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Evolução da banca
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <BankrollChart data={chartData} />
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                <Spade className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Registre sua primeira sessão para ver a evolução.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      {hasData && <SessionsTable rows={rows} />}
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={`mt-1 text-xl font-semibold tabular-nums ${accent ?? ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}