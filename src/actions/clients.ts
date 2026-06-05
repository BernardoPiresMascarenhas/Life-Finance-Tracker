"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema, type ClientInput } from "@/schemas/freelance";

export type ActionResult = { success?: true; error?: string };

// 1. Alterado para retornar o ID do usuário
async function getAuthUser() {
  const session = await auth();
  return session?.user?.id;
}

function clean(input: ClientInput) {
  return {
    name: input.name,
    company: input.company || null,
    phone: input.phone || null,
    email: input.email || null,
    note: input.note || null,
  };
}

export async function createClient(input: ClientInput): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  // 2. Injeta o userId na hora de criar
  await prisma.client.create({ 
    data: { 
      ...clean(parsed.data),
      userId: userId 
    } 
  });
  
  revalidatePath("/freelances");
  return { success: true };
}

export async function updateClient(
  id: string,
  input: ClientInput
): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  // 3. Usa updateMany para garantir que só edita se o ID do cliente e o userId baterem
  const result = await prisma.client.updateMany({ 
    where: { id: id, userId: userId }, 
    data: clean(parsed.data) 
  });

  if (result.count === 0) return { error: "Cliente não encontrado ou não autorizado." };

  revalidatePath("/freelances");
  return { success: true };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const userId = await getAuthUser();
  if (!userId) return { error: "Não autorizado." };

  // 4. Usa deleteMany pela mesma regra de segurança
  // Cascade remove os projetos; os recebimentos (transações) ficam com
  // projectId nulo — a renda registrada não some.
  const result = await prisma.client.deleteMany({ 
    where: { id: id, userId: userId } 
  });

  if (result.count === 0) return { error: "Cliente não encontrado ou não autorizado." };

  revalidatePath("/freelances");
  revalidatePath("/transactions");
  return { success: true };
}