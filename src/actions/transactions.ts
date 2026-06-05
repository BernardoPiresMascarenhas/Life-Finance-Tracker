"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema, type TransactionInput } from "@/schemas/transaction";

export type ActionResult = { success?: true; error?: string };

// 1. Função atualizada para buscar o ID do usuário
async function getAuthUser() {
  const session = await auth();
  return session?.user?.id;
}

function revalidate() {
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function createTransaction(
  input: TransactionInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { note, ...rest } = parsed.data;
  await prisma.transaction.create({
    data: { 
      ...rest, 
      note: note || null, 
      source: "MANUAL",
      userId: userId // 👈 AQUI! Carimbando o dono da transação manual.
    },
  });

  revalidate();
  return { success: true };
}

export async function updateTransaction(
  id: string,
  input: TransactionInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const existing = await prisma.transaction.findUnique({ where: { id } });
  
  // 👇 Trava de segurança: impede que a Luna edite as suas transações e vice-versa
  if (!existing || existing.userId !== userId) {
    return { error: "Transação não encontrada ou acesso negado." };
  }
  
  if (existing.source !== "MANUAL")
    return {
      error: "Transações geradas automaticamente são editadas na origem.",
    };

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { note, ...rest } = parsed.data;
  await prisma.transaction.update({
    where: { id },
    data: { ...rest, note: note || null },
  });

  revalidate();
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const existing = await prisma.transaction.findUnique({ where: { id } });
  
  // 👇 Trava de segurança: impede que outra pessoa apague sua transação
  if (!existing || existing.userId !== userId) {
    return { error: "Transação não encontrada ou acesso negado." };
  }
  
  if (existing.source !== "MANUAL")
    return {
      error: "Transações geradas automaticamente são excluídas na origem.",
    };

  await prisma.transaction.delete({ where: { id } });

  revalidate();
  return { success: true };
}