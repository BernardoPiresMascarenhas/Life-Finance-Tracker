"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { snapshotSchema, type SnapshotInput } from "@/schemas/networth";
import { createSnapshot, updateSnapshot } from "@/actions/networth";
import { formatBRL } from "@/lib/format";
import type { SnapshotRow } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  children?: React.ReactNode;
  snapshot?: SnapshotRow;
  // valores atuais derivados dos outros módulos (pré-preenchem um snapshot novo)
  prefillReceivables?: number;
  prefillBankroll?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toInput(
  s: SnapshotRow | undefined,
  prefillReceivables = 0,
  prefillBankroll = 0
): SnapshotInput {
  return {
    date: s ? new Date(s.date) : new Date(),
    checkingAccount: s?.checkingAccount ?? 0,
    investments: s?.investments ?? 0,
    crypto: s?.crypto ?? 0,
    otherAssets: s?.otherAssets ?? 0,
    receivables: s?.receivables ?? prefillReceivables,
    pokerBankroll: s?.pokerBankroll ?? prefillBankroll,
    note: s?.note ?? "",
  };
}

export function SnapshotDialog({
  children,
  snapshot,
  prefillReceivables = 0,
  prefillBankroll = 0,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!snapshot;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = isControlled ? open : internalOpen;
  const [pending, setPending] = useState(false);

  const form = useForm<SnapshotInput>({
    resolver: zodResolver(snapshotSchema),
    defaultValues: toInput(snapshot, prefillReceivables, prefillBankroll),
  });

  function setOpen(next: boolean) {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toInput(snapshot, prefillReceivables, prefillBankroll));
  }

  async function onSubmit(values: SnapshotInput) {
    setPending(true);
    const result = isEdit
      ? await updateSnapshot(snapshot!.id, values)
      : await createSnapshot(values);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success(isEdit ? "Snapshot atualizado." : "Snapshot registrado.");
    setOpen(false);
    if (!isEdit)
      form.reset(toInput(undefined, prefillReceivables, prefillBankroll));
  }

  const w = form.watch();
  const total =
    (Number(w.checkingAccount) || 0) +
    (Number(w.investments) || 0) +
    (Number(w.crypto) || 0) +
    (Number(w.otherAssets) || 0) +
    (Number(w.receivables) || 0) +
    (Number(w.pokerBankroll) || 0);

  const dateValue = (() => {
    const d = form.watch("date");
    const dt = d instanceof Date ? d : new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
  })();

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar snapshot" : "Novo snapshot"}
          </DialogTitle>
          <DialogDescription>
            Fotografia do seu patrimônio nesta data. A receber e a banca já
            vêm preenchidos com o valor atual — ajuste se quiser.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={dateValue}
              onChange={(e) => form.setValue("date", new Date(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MoneyField form={form} name="checkingAccount" label="Conta corrente" />
            <MoneyField form={form} name="investments" label="Investimentos" />
            <MoneyField form={form} name="crypto" label="Cripto" />
            <MoneyField form={form} name="otherAssets" label="Espécie / outros" />
            <MoneyField form={form} name="receivables" label="A receber" />
            <MoneyField form={form} name="pokerBankroll" label="Banca (poker)" />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-secondary/40 px-3 py-2">
            <span className="text-sm text-muted-foreground">Patrimônio total</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatBRL(total)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observação (opcional)</Label>
            <Textarea id="note" rows={2} {...form.register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// campo monetário genérico
function MoneyField({
  form,
  name,
  label,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: keyof SnapshotInput;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} (R$)</Label>
      <Input
        id={name}
        type="number"
        step="0.01"
        {...form.register(name)}
      />
      {form.formState.errors[name] && (
        <p className="text-sm text-destructive">
          {form.formState.errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}
