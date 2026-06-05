"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { clientSchema, type ClientInput } from "@/schemas/freelance";
import { createClient, updateClient } from "@/actions/clients";
import type { ClientRow } from "./types";

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
  client?: ClientRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toInput(c?: ClientRow): ClientInput {
  return {
    name: c?.name ?? "",
    company: c?.company ?? "",
    phone: c?.phone ?? "",
    email: c?.email ?? "",
    note: c?.note ?? "",
  };
}

export function ClientDialog({ children, client, open, onOpenChange }: Props) {
  const isEdit = !!client;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = isControlled ? open : internalOpen;
  const [pending, setPending] = useState(false);

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: toInput(client),
  });

  function setOpen(next: boolean) {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toInput(client));
  }

  async function onSubmit(values: ClientInput) {
    setPending(true);
    const result = isEdit
      ? await updateClient(client!.id, values)
      : await createClient(values);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success(isEdit ? "Cliente atualizado." : "Cliente adicionado.");
    setOpen(false);
    if (!isEdit) form.reset(toInput());
  }

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>Dados de contato do cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" {...form.register("company")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Observações</Label>
            <Textarea id="note" rows={3} {...form.register("note")} />
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
