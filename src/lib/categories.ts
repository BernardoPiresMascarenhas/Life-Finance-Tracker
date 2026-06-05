// Categorias base mantidas para os tipos do TypeScript
export const ALL_INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Poker",
  "Investimentos",
  "Outros",
] as const;

export const ALL_EXPENSE_CATEGORIES = [
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

export type IncomeCategory = (typeof ALL_INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof ALL_EXPENSE_CATEGORIES)[number];

// Função para filtrar Receitas
export function getIncomeCategories(userEmail?: string | null) {
  // Se for o seu e-mail, retorna todas as categorias
  if (userEmail === "bernardomasca3008@gmail.com") {
    return ALL_INCOME_CATEGORIES;
  }
  // Se for cliente, tira o Poker da lista
  return ALL_INCOME_CATEGORIES.filter((cat) => cat !== "Poker");
}

// Função para filtrar Despesas
export function getExpenseCategories(userEmail?: string | null) {
  if (userEmail === "bernardomasca3008@gmail.com") {
    return ALL_EXPENSE_CATEGORIES;
  }
  return ALL_EXPENSE_CATEGORIES.filter((cat) => cat !== "Poker");
}