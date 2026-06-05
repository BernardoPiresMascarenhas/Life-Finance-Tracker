const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number | string) {
  return BRL.format(Number(value));
}

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: Date | string) {
  return DATE.format(new Date(value));
}

// "2026-06" → primeiro/último instante do mês (para filtros)
export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 0, 23, 59, 59, 999);
  return { from, to };
}

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
