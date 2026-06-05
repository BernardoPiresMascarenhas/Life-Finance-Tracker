"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePokerSession } from "@/actions/poker";
import { formatBRL, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionRow } from "./types";
import { PokerTypeBadge } from "./poker-type-badge";
import { SessionDialog } from "./session-dialog";

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

function SessionActions({ session }: { session: SessionRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deletePokerSession(session.id);
    setDeleting(false);
    if (result?.error) return toast.error(result.error);
    toast.success("Sessão excluída.");
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

      <SessionDialog
        session={session}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              A movimentação correspondente nas finanças também será removida.
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

export function SessionsTable({ rows }: { rows: SessionRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[110px]">Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Local</TableHead>
            <TableHead className="text-right">Buy-in</TableHead>
            <TableHead className="text-right">Cash-out</TableHead>
            <TableHead className="text-right">Horas</TableHead>
            <TableHead className="text-right">Resultado</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => {
            const win = s.netResult > 0;
            const loss = s.netResult < 0;
            return (
              <TableRow key={s.id}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatDate(s.date)}
                </TableCell>
                <TableCell>
                  <PokerTypeBadge type={s.type} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.location ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(s.buyIn)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(s.cashOut)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {s.hours}h
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    win && "text-emerald-500",
                    loss && "text-destructive"
                  )}
                >
                  {win ? "+" : loss ? "−" : ""} {formatBRL(Math.abs(s.netResult))}
                </TableCell>
                <TableCell>
                  <SessionActions session={s} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
