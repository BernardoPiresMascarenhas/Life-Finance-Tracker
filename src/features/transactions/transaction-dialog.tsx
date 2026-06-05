"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react"; // 👈 Importamos o useSession
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { transactionSchema, type TransactionInput } from "@/schemas/transaction";
// 👇 Importamos as novas funções de filtro em vez das listas estáticas
import { getIncomeCategories, getExpenseCategories } from "@/lib/categories";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import type { TransactionRow } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  children?: React.ReactNode;
  transaction?: TransactionRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toInput(t?: TransactionRow): TransactionInput {
  return {
    type: t?.type ?? "EXPENSE",
    title: t?.title ?? "",
    category: t?.category ?? "",
    amount: t?.amount ?? 0,
    date: t ? new Date(t.date) : new Date(),
    note: t?.note ?? "",
  };
}

export function TransactionDialog({
  children,
  transaction,
  open,
  onOpenChange,
}: Props) {
  const { data: session } = useSession(); // 👈 Pegamos a sessão do usuário

  const isEdit = !!transaction;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = isControlled ? open : internalOpen;
  const [pending, setPending] = useState(false);

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: toInput(transaction),
  });

  const type = form.watch("type");
  
  // 👇 Filtramos as categorias passando o e-mail do usuário logado
  const categories = type === "INCOME" 
    ? getIncomeCategories(session?.user?.email) 
    : getExpenseCategories(session?.user?.email);

  function setOpen(next: boolean) {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toInput(transaction));
  }

  async function onSubmit(values: TransactionInput) {
    setPending(true);
    const result = isEdit
      ? await updateTransaction(transaction!.id, values)
      : await createTransaction(values);
    setPending(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Transação atualizada." : "Transação adicionada.");
    setOpen(false);
    if (!isEdit) form.reset(toInput());
  }

  const dateValue = (() => {
    const d = form.watch("date");
    const dt = d instanceof Date ? d : new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
  })();

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados desta movimentação."
              : "Registre uma receita ou despesa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                form.setValue("type", v as TransactionInput["type"]);
                form.setValue("category", "");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
                <SelectItem value="INCOME">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={dateValue}
              onChange={(e) => form.setValue("date", new Date(e.target.value))}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observação (opcional)</Label>
            <Input id="note" {...form.register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}