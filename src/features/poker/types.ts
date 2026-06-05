export type PokerType = "CASH" | "TOURNAMENT" | "SITNGO";

export type SessionRow = {
  id: string;
  type: PokerType;
  date: string;
  location: string | null;
  buyIn: number;
  cashOut: number;
  hours: number;
  netResult: number;
  note: string | null;
};

export type ChartPoint = {
  label: string; // data curta da sessão
  bankroll: number; // lucro acumulado até esta sessão
};
