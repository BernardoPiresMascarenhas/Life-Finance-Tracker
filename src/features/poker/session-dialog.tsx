"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { pokerSessionSchema, type PokerSessionInput } from "@/schemas/poker";
import { createPokerSession, updatePokerSession } from "@/actions/poker";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionRow } from "./types";
import { POKER_TYPE_OPTIONS } from "./poker-type-badge";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  children?: React.ReactNode;
  session?: SessionRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toInput(s?: SessionRow): PokerSessionInput {
  return {
    type: s?.type ?? "CASH",
    date: s ? new Date(s.date) : new Date(),
    buyIn: s?.buyIn ?? 0,
    cashOut: s?.cashOut ?? 0,
    hours: s?.hours ?? 0,
    location: s?.location ?? "",
    note: s?.note ?? "",
  };
}

export function SessionDialog({ children, session, open, onOpenChange }: Props) {
  const isEdit = !!session;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = isControlled ? open : internalOpen;
  const [pending, setPending] = useState(false);

  const form = useForm<PokerSessionInput>({
    resolver: zodResolver(pokerSessionSchema),
    defaultValues: toInput(session),
  });

  function setOpen(next: boolean) {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toInput(session));
  }

  async function onSubmit(values: PokerSessionInput) {
    setPending(true);
    const result = isEdit
      ? await updatePokerSession(session!.id, values)
      : await createPokerSession(values);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success(isEdit ? "Sessão atualizada." : "Sessão registrada.");
    setOpen(false);
    if (!isEdit) form.reset(toInput());
  }

  // preview do resultado em tempo real
  const buyIn = Number(form.watch("buyIn")) || 0;
  const cashOut = Number(form.watch("cashOut")) || 0;
  const net = Math.round((cashOut - buyIn) * 100) / 100;

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
            {isEdit ? "Editar sessão" : "Nova sessão"}
          </DialogTitle>
          <DialogDescription>
            Buy-in é o investimento total na reta; cash-out é o retorno total.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo de jogo</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) =>
                  form.setValue("type", v as PokerSessionInput["type"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POKER_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={dateValue}
                onChange={(e) => form.setValue("date", new Date(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="buyIn">Buy-in (R$)</Label>
              <Input
                id="buyIn"
                type="number"
                step="0.01"
                min="0"
                {...form.register("buyIn")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cashOut">Cash-out (R$)</Label>
              <Input
                id="cashOut"
                type="number"
                step="0.01"
                min="0"
                {...form.register("cashOut")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Horas</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                {...form.register("hours")}
              />
            </div>
          </div>

          {/* Preview do resultado */}
          <div className="flex items-center justify-between rounded-md border bg-secondary/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Resultado</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                net > 0
                  ? "text-emerald-500"
                  : net < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              )}
            >
              {net > 0 ? "+" : net < 0 ? "−" : ""} {formatBRL(Math.abs(net))}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local / Plataforma</Label>
            <Input id="location" {...form.register("location")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observações</Label>
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
