import { prisma } from "@/lib/prisma";

// Saldo em caixa = todas as receitas menos todas as despesas (todo o histórico).
// Inclui automaticamente poker e freelance, que já entram como transações.
export async function getCashBalance(userId: string): Promise<number> {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
        type: "INCOME",
        userId: userId // 👈 Filtra só as suas receitas
      },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
        type: "EXPENSE",
        userId: userId // 👈 Filtra só as suas despesas
      },
    }),
  ]);
  return Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0);
}

// A receber = pendente dos projetos em andamento ou pausados.
export async function getReceivables(userId: string): Promise<number> {
  const agg = await prisma.project.aggregate({
    _sum: { totalValue: true, receivedValue: true },
    where: { 
      status: { in: ["IN_PROGRESS", "PAUSED"] },
      userId: userId // 👈 Filtra só os seus projetos
    },
  });
  return (
    Number(agg._sum.totalValue ?? 0) - Number(agg._sum.receivedValue ?? 0)
  );
}

// Banca de poker = lucro/prejuízo acumulado de todas as sessões.
export async function getPokerBankroll(userId: string): Promise<number> {
  const agg = await prisma.pokerSession.aggregate({
    _sum: { netResult: true },
    where: {
      userId: userId // 👈 Filtra só as suas sessões de poker
    }
  });
  return Number(agg._sum.netResult ?? 0);
}