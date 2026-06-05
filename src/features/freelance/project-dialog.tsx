"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { projectSchema, type ProjectInput } from "@/schemas/freelance";
import { createProject, updateProject } from "@/actions/projects";
import type { ProjectRow, ClientOption } from "./types";
import { STATUS_OPTIONS } from "./status-badge";

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
  project?: ProjectRow;
  clients: ClientOption[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toInput(p?: ProjectRow): ProjectInput {
  return {
    name: p?.name ?? "",
    clientId: p?.clientId ?? "",
    totalValue: p?.totalValue ?? 0,
    status: p?.status ?? "IN_PROGRESS",
    startDate: p ? new Date(p.startDate) : new Date(),
    dueDate: p?.dueDate ? new Date(p.dueDate) : null,
    note: p?.note ?? "",
  };
}

function dateStr(d: Date | string | null | undefined) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

export function ProjectDialog({
  children,
  project,
  clients,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!project;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = isControlled ? open : internalOpen;
  const [pending, setPending] = useState(false);

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: toInput(project),
  });

  function setOpen(next: boolean) {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  }
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toInput(project));
  }

  async function onSubmit(values: ProjectInput) {
    setPending(true);
    const result = isEdit
      ? await updateProject(project!.id, values)
      : await createProject(values);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success(isEdit ? "Projeto atualizado." : "Projeto criado.");
    setOpen(false);
    if (!isEdit) form.reset(toInput());
  }

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar projeto" : "Novo projeto"}</DialogTitle>
          <DialogDescription>
            O valor recebido é controlado pelos recebimentos, não aqui.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do projeto</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select
              value={form.watch("clientId")}
              onValueChange={(v) => form.setValue("clientId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Cadastre um cliente primeiro
                  </div>
                )}
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clientId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.clientId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor total (R$)</Label>
              <Input
                id="totalValue"
                type="number"
                step="0.01"
                min="0"
                {...form.register("totalValue")}
              />
              {form.formState.errors.totalValue && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.totalValue.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) =>
                  form.setValue("status", v as ProjectInput["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Início</Label>
              <Input
                id="startDate"
                type="date"
                value={dateStr(form.watch("startDate"))}
                onChange={(e) =>
                  form.setValue("startDate", new Date(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Entrega (opcional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dateStr(form.watch("dueDate"))}
                onChange={(e) =>
                  form.setValue(
                    "dueDate",
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observações</Label>
            <Textarea id="note" rows={2} {...form.register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
