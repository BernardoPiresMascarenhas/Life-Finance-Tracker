// Tipo serializável passado do server para os client components
// (Decimal vira number, Date vira string ISO).
export type TransactionRow = {
  id: string;
  type: "INCOME" | "EXPENSE";
  source: "MANUAL" | "POKER" | "FREELANCE";
  category: string;
  title: string;
  amount: number;
  date: string;
  note: string | null;
};
