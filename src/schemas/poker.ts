import { z } from "zod";

export const POKER_TYPES = ["CASH", "TOURNAMENT", "SITNGO"] as const;
export type PokerType = (typeof POKER_TYPES)[number];

export const pokerSessionSchema = z.object({
  type: z.enum(POKER_TYPES),
  date: z.coerce.date({ invalid_type_error: "Data inválida" }),
  buyIn: z.coerce
    .number({ invalid_type_error: "Valor inválido" })
    .nonnegative("Não pode ser negativo"),
  cashOut: z.coerce
    .number({ invalid_type_error: "Valor inválido" })
    .nonnegative("Não pode ser negativo"),
  hours: z.coerce
    .number({ invalid_type_error: "Valor inválido" })
    .nonnegative("Não pode ser negativo"),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type PokerSessionInput = z.infer<typeof pokerSessionSchema>;
