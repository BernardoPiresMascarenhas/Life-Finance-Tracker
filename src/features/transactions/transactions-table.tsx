import { formatBRL, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionRow } from "./types";
import { TransactionRowActions } from "./transaction-row-actions";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionsTable({ rows }: { rows: TransactionRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px]">Data</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((tx) => {
            const income = tx.type === "INCOME";
            return (
              <TableRow key={tx.id}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {tx.title}
                    {tx.source !== "MANUAL" && (
                      <Badge variant="outline" className="text-[10px]">
                        {tx.source === "POKER" ? "Poker" : "Freelance"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {tx.category}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    income ? "text-emerald-500" : "text-foreground"
                  )}
                >
                  {income ? "+" : "−"} {formatBRL(tx.amount)}
                </TableCell>
                <TableCell>
                  <TransactionRowActions tx={tx} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
