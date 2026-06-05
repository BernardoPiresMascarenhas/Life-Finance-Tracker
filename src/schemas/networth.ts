import { z } from "zod";

const money = z.coerce.number({ invalid_type_error: "Valor inválido" });
const nonNeg = money.nonnegative("Não pode ser negativo");

export const snapshotSchema = z.object({
  date: z.coerce.date({ invalid_type_error: "Data inválida" }),
  checkingAccount: nonNeg,
  investments: nonNeg,
  crypto: nonNeg,
  otherAssets: nonNeg,
  receivables: nonNeg,
  pokerBankroll: money, // pode ser negativa (prejuízo acumulado)
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export type SnapshotInput = z.infer<typeof snapshotSchema>;
