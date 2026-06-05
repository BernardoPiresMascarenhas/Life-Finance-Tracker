"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteClient } from "@/actions/clients";
import type { ClientRow } from "./types";
import { ClientDialog } from "./client-dialog";

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

function ClientActions({ client }: { client: ClientRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteClient(client.id);
    setDeleting(false);
    if (result?.error) return toast.error(result.error);
    toast.success("Cliente excluído.");
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

      <ClientDialog client={client} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              {client.projectCount > 0
                ? `Isto também removerá ${client.projectCount} projeto(s). Os recebimentos já lançados nas finanças são mantidos.`
                : "Esta ação não pode ser desfeita."}
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

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="text-center">Projetos</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {c.company ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.email ?? c.phone ?? "—"}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {c.projectCount}
              </TableCell>
              <TableCell>
                <ClientActions client={c} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
