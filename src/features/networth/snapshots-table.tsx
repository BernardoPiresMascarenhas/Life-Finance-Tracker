"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteSnapshot } from "@/actions/networth";
import { formatBRL, formatDate } from "@/lib/format";
import type { SnapshotRow } from "./types";
import { SnapshotDialog } from "./snapshot-dialog";

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

function SnapshotActions({ snapshot }: { snapshot: SnapshotRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteSnapshot(snapshot.id);
    setDeleting(false);
    if (result?.error) return toast.error(result.error);
    toast.success("Snapshot excluído.");
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

      <SnapshotDialog
        snapshot={snapshot}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              A foto de {formatDate(snapshot.date)} será removida do histórico.
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

export function SnapshotsTable({ rows }: { rows: SnapshotRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[110px]">Data</TableHead>
            <TableHead className="text-right">Conta</TableHead>
            <TableHead className="text-right">Investimentos</TableHead>
            <TableHead className="text-right">Cripto</TableHead>
            <TableHead className="text-right">A receber</TableHead>
            <TableHead className="text-right">Banca</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDate(s.date)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBRL(s.checkingAccount)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBRL(s.investments)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBRL(s.crypto)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatBRL(s.receivables)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatBRL(s.pokerBankroll)}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {formatBRL(s.total)}
              </TableCell>
              <TableCell>
                <SnapshotActions snapshot={s} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
