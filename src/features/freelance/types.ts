export type ProjectStatus = "IN_PROGRESS" | "DONE" | "PAUSED" | "CANCELLED";

export type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  projectCount: number;
};

export type PaymentRow = {
  id: string;
  amount: number;
  date: string;
  note: string | null;
};

export type ProjectRow = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  totalValue: number;
  receivedValue: number;
  status: ProjectStatus;
  startDate: string;
  dueDate: string | null;
  note: string | null;
  payments: PaymentRow[];
};

// opções leves de cliente para o select do formulário de projeto
export type ClientOption = { id: string; name: string };
