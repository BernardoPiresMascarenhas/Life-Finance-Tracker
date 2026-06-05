// Categorias mantidas em código (não como enum no banco) para você
// adicionar/remover sem precisar de migration.

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Poker",
  "Investimentos",
  "Outros",
] as const;

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Assinaturas",
  "Poker",
  "Outros",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
