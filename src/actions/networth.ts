"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { snapshotSchema, type SnapshotInput } from "@/schemas/networth";

export type ActionResult = { success?: true; error?: string };

// 1. Alterado para devolver o ID do usuário
async function getAuthUser() {
  const session = await auth();
  return session?.user?.id;
}

function revalidate() {
  revalidatePath("/patrimonio");
  revalidatePath("/dashboard");
}

// normaliza para meia-noite (1 snapshot por dia)
function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sumOf(d: SnapshotInput) {
  return (
    d.checkingAccount +
    d.investments +
    d.crypto +
    d.otherAssets +
    d.receivables +
    d.pokerBankroll
  );
}

export async function createSnapshot(
  input: SnapshotInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const date = dayStart(parsed.data.date);
  
  // 👇 Busca usando a chave composta (Usuário + Data)
  const existing = await prisma.netWorthSnapshot.findUnique({ 
    where: { userId_date: { userId, date } } 
  });
  
  if (existing)
    return { error: "Já existe um snapshot nesta data. Edite o existente." };

  const { note, ...values } = parsed.data;
  await prisma.netWorthSnapshot.create({
    data: { 
      ...values, 
      date, 
      note: note || null, 
      total: sumOf(parsed.data),
      userId // 👈 Vinculando o patrimônio ao dono
    },
  });

  revalidate();
  return { success: true };
}

export async function updateSnapshot(
  id: string,
  input: SnapshotInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Bloqueio de segurança: checa se o patrimônio é da pessoa antes de editar
  const snapshot = await prisma.netWorthSnapshot.findUnique({ where: { id } });
  if (!snapshot || snapshot.userId !== userId) {
    return { error: "Patrimônio não encontrado ou acesso negado." };
  }

  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const date = dayStart(parsed.data.date);
  const clash = await prisma.netWorthSnapshot.findUnique({ 
    where: { userId_date: { userId, date } } 
  });
  
  if (clash && clash.id !== id)
    return { error: "Já existe um snapshot nesta data." };

  const { note, ...values } = parsed.data;
  await prisma.netWorthSnapshot.update({
    where: { id },
    data: { ...values, date, note: note || null, total: sumOf(parsed.data) },
  });

  revalidate();
  return { success: true };
}

export async function deleteSnapshot(id: string): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Bloqueio de segurança: checa se o patrimônio é da pessoa antes de apagar
  const snapshot = await prisma.netWorthSnapshot.findUnique({ where: { id } });
  if (!snapshot || snapshot.userId !== userId) {
    return { error: "Patrimônio não encontrado ou acesso negado." };
  }

  await prisma.netWorthSnapshot.delete({ where: { id } });
  revalidate();
  return { success: true };
}