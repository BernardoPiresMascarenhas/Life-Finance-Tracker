"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { paymentSchema, type PaymentInput } from "@/schemas/freelance";
import { addProjectPayment, deleteProjectPayment } from "@/actions/projects";
import { formatBRL, formatDate } from "@/lib/format";
import type { ProjectRow } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PaymentDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const pending_value = project.totalValue - project.receivedValue;

  const form = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, date: new Date(), note: "" },
  });

  const dateValue = (() => {
    const d = form.watch("date");
    const dt = d instanceof Date ? d : new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
  })();

  async function onSubmit(values: PaymentInput) {
    setPending(true);
    const result = await addProjectPayment(project.id, values);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success("Recebimento registrado.");
    form.reset({ amount: 0, date: new Date(), note: "" });
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    const result = await deleteProjectPayment(id);
    setRemovingId(null);
    if (result?.error) return toast.error(result.error);
    toast.success("Recebimento removido.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recebimentos — {project.name}</DialogTitle>
          <DialogDescription>
            Pendente: {formatBRL(pending_value)} de{" "}
            {formatBRL(project.totalValue)}
          </DialogDescription>
        </DialogHeader>

        {/* Novo recebimento */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="amount" className="text-xs">
              Valor (R$)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...form.register("amount")}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="pdate" className="text-xs">
              Data
            </Label>
            <Input
              id="pdate"
              type="date"
              value={dateValue}
              onChange={(e) => form.setValue("date", new Date(e.target.value))}
            />
          </div>
          <Button type="submit" disabled={pending || pending_value <= 0}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </form>
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
        )}

        {/* Histórico */}
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {project.payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum recebimento ainda.
            </p>
          ) : (
            project.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="tabular-nums">{formatDate(p.date)}</span>
                <span className="font-medium tabular-nums text-emerald-500">
                  {formatBRL(p.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={removingId === p.id}
                  onClick={() => handleRemove(p.id)}
                >
                  {removingId === p.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
