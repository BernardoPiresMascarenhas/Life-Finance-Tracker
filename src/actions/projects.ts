"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  projectSchema,
  paymentSchema,
  type ProjectInput,
  type PaymentInput,
} from "@/schemas/freelance";

export type ActionResult = { success?: true; error?: string };

// 1. Função atualizada: Agora ela devolve o ID do usuário (ou null se não logado)
async function getAuthUser() {
  const session = await auth();
  return session?.user?.id;
}

function revalidate() {
  revalidatePath("/freelances");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function createProject(
  input: ProjectInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };
  
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { note, dueDate, ...rest } = parsed.data;
  await prisma.project.create({
    data: { 
      ...rest, 
      dueDate: dueDate ?? null, 
      note: note || null,
      userId: userId, // 👈 LINHA DESCOMENTADA! Agora o projeto tem um dono oficial.
    },
  });
  revalidate();
  return { success: true };
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Trava de segurança: verifica se o projeto pertence ao usuário
  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject || existingProject.userId !== userId) {
    return { error: "Projeto não encontrado ou acesso negado." };
  }

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { note, dueDate, ...rest } = parsed.data;
  await prisma.project.update({
    where: { id },
    data: { ...rest, dueDate: dueDate ?? null, note: note || null },
  });
  revalidate();
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Trava de segurança: verifica se o projeto pertence ao usuário
  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject || existingProject.userId !== userId) {
    return { error: "Projeto não encontrado ou acesso negado." };
  }

  // Recebimentos (transações) ficam com projectId nulo, não são apagados.
  await prisma.project.delete({ where: { id } });
  revalidate();
  return { success: true };
}

// ───────── A PONTE FINANCEIRA ─────────
export async function addProjectPayment(
  projectId: string,
  input: PaymentInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  // 👇 Trava de segurança: verifica se o projeto que está recebendo o pagamento é seu
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) {
    return { error: "Projeto não encontrado ou acesso negado." };
  }

  const pending = Number(project.totalValue) - Number(project.receivedValue);
  if (parsed.data.amount > pending + 0.005) {
    return {
      error: `Valor acima do pendente (R$ ${pending.toFixed(2)}).`,
    };
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type: "INCOME",
        source: "FREELANCE",
        category: "Freelance",
        title: `Recebimento — ${project.name}`,
        amount: parsed.data.amount,
        date: parsed.data.date,
        note: parsed.data.note || null,
        projectId,
        userId: userId, // Vincula a transação ao dono
      },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: { receivedValue: { increment: parsed.data.amount } },
    }),
  ]);

  revalidate();
  return { success: true };
}

export async function deleteProjectPayment(
  transactionId: string
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 👇 Trava de segurança: verifica se a transação que está sendo apagada é sua
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  
  if (!tx || tx.userId !== userId || tx.source !== "FREELANCE" || !tx.projectId) {
    return { error: "Recebimento não encontrado ou acesso negado." };
  }

  await prisma.$transaction([
    prisma.transaction.delete({ where: { id: transactionId } }),
    prisma.project.update({
      where: { id: tx.projectId },
      data: { receivedValue: { decrement: Number(tx.amount) } },
    }),
  ]);

  revalidate();
  return { success: true };
}