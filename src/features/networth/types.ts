export type SnapshotRow = {
  id: string;
  date: string;
  checkingAccount: number;
  investments: number;
  crypto: number;
  otherAssets: number;
  receivables: number;
  pokerBankroll: number;
  total: number;
  note: string | null;
};

export type NetWorthPoint = {
  label: string; // mês/ano curto
  total: number;
};
