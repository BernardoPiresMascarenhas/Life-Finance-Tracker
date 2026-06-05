"use client";

import { useState } from "react";
import { MoreHorizontal, Wallet, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProject } from "@/actions/projects";
import { formatBRL } from "@/lib/format";
import type { ProjectRow, ClientOption } from "./types";
import { StatusBadge } from "./status-badge";
import { ProjectDialog } from "./project-dialog";
import { PaymentDialog } from "./payment-dialog";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ProjectActions({
  project,
  clients,
}: {
  project: ProjectRow;
  clients: ClientOption[];
}) {
  const [payOpen, setPayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteProject(project.id);
    setDeleting(false);
    if (result?.error) return toast.error(result.error);
    toast.success("Projeto excluído.");
    setConfirmOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setPayOpen(true);
            }}
          >
            <Wallet className="mr-2 h-4 w-4" /> Recebimentos
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditOpen(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentDialog project={project} open={payOpen} onOpenChange={setPayOpen} />
      <ProjectDialog
        project={project}
        clients={clients}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{project.name}&quot; será removido. Os recebimentos já
              lançados nas finanças são mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ProjectsTable({
  rows,
  clients,
}: {
  rows: ProjectRow[];
  clients: ClientOption[];
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Recebido</TableHead>
            <TableHead className="text-right">Pendente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => {
            const pending = p.totalValue - p.receivedValue;
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.clientName}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(p.totalValue)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-500">
                  {formatBRL(p.receivedValue)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatBRL(pending)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell>
                  <ProjectActions project={p} clients={clients} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
