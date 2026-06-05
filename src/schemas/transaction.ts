import { z } from "zod";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/categories";

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    title: z.string().trim().min(1, "Informe um título").max(120),
    category: z.string().min(1, "Selecione uma categoria"),
    amount: z.coerce
      .number({ invalid_type_error: "Valor inválido" })
      .positive("O valor deve ser maior que zero"),
    date: z.coerce.date({ invalid_type_error: "Data inválida" }),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const allowed: readonly string[] =
      data.type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!allowed.includes(data.category)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: "Categoria não corresponde ao tipo",
      });
    }
  });

export type TransactionInput = z.infer<typeof transactionSchema>;
