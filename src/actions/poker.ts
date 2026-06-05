"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pokerSessionSchema, type PokerSessionInput } from "@/schemas/poker";

export type ActionResult = { success?: true; error?: string };

// 1. Alterado para devolver o ID do usuário
async function getAuthUser() {
  const session = await auth();
  return session?.user?.id;
}

function revalidate() {
  revalidatePath("/poker");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

// dinheiro: arredonda para 2 casas para evitar ruído de ponto flutuante
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const TYPE_LABEL: Record<string, string> = {
  CASH: "Cash Game",
  TOURNAMENT: "Torneio",
  SITNGO: "Sit & Go",
};

export async function createPokerSession(
  input: PokerSessionInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const parsed = pokerSessionSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { buyIn, cashOut, hours, type, date, location, note } = parsed.data;
  const net = round2(cashOut - buyIn);

  await prisma.$transaction(async (tx) => {
    const session = await tx.pokerSession.create({
      data: {
        type,
        date,
        buyIn,
        cashOut,
        hours,
        netResult: net,
        location: location || null,
        note: note || null,
        userId: userId, // 👈 Vincula a sessão de poker ao dono
      },
    });

    // Ponte: só gera movimentação financeira se houve lucro ou prejuízo.
    if (net !== 0) {
      await tx.transaction.create({
        data: {
          type: net > 0 ? "INCOME" : "EXPENSE",
          source: "POKER",
          category: "Poker",
          title: `Poker — ${TYPE_LABEL[type]}`,
          amount: Math.abs(net),
          date,
          pokerSessionId: session.id,
          userId: userId, // 👈 Vincula a transação financeira gerada ao dono
        },
      });
    }
  });

  revalidate();
  return { success: true };
}

export async function updatePokerSession(
  id: string,
  input: PokerSessionInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Trava de segurança: verifica se a sessão pertence ao usuário
  const existingSession = await prisma.pokerSession.findUnique({ where: { id } });
  if (!existingSession || existingSession.userId !== userId) {
    return { error: "Sessão não encontrada ou acesso negado." };
  }

  const parsed = pokerSessionSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { buyIn, cashOut, hours, type, date, location, note } = parsed.data;
  const net = round2(cashOut - buyIn);

  await prisma.$transaction(async (tx) => {
    await tx.pokerSession.update({
      where: { id },
      data: {
        type,
        date,
        buyIn,
        cashOut,
        hours,
        netResult: net,
        location: location || null,
        note: note || null,
      },
    });

    // Recria a transação espelho do zero (mais simples e à prova de erro
    // do que tentar conciliar o estado anterior).
    await tx.transaction.deleteMany({ where: { pokerSessionId: id } });
    if (net !== 0) {
      await tx.transaction.create({
        data: {
          type: net > 0 ? "INCOME" : "EXPENSE",
          source: "POKER",
          category: "Poker",
          title: `Poker — ${TYPE_LABEL[type]}`,
          amount: Math.abs(net),
          date,
          pokerSessionId: id,
          userId: userId, // 👈 Garante que a nova transação espelho tenha o dono correto
        },
      });
    }
  });

  revalidate();
  return { success: true };
}

export async function deletePokerSession(id: string): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Trava de segurança: verifica se a sessão pertence ao usuário
  const existingSession = await prisma.pokerSession.findUnique({ where: { id } });
  if (!existingSession || existingSession.userId !== userId) {
    return { error: "Sessão não encontrada ou acesso negado." };
  }

  // onDelete: Cascade na FK da Transaction remove a transação espelho junto.
  await prisma.pokerSession.delete({ where: { id } });
  revalidate();
  return { success: true };
}