import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  company: optionalText(120),
  phone: optionalText(40),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  note: optionalText(500),
});
export type ClientInput = z.infer<typeof clientSchema>;

export const PROJECT_STATUSES = [
  "IN_PROGRESS",
  "DONE",
  "PAUSED",
  "CANCELLED",
] as const;

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do projeto").max(160),
  clientId: z.string().min(1, "Selecione um cliente"),
  totalValue: z.coerce
    .number({ invalid_type_error: "Valor inválido" })
    .positive("O valor deve ser maior que zero"),
  status: z.enum(PROJECT_STATUSES),
  startDate: z.coerce.date({ invalid_type_error: "Data inválida" }),
  dueDate: z.coerce.date().optional().nullable(),
  note: optionalText(500),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const paymentSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Valor inválido" })
    .positive("O valor deve ser maior que zero"),
  date: z.coerce.date({ invalid_type_error: "Data inválida" }),
  note: optionalText(300),
});
export type PaymentInput = z.infer<typeof paymentSchema>;
