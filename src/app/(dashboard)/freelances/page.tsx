import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";
import type {
  ProjectRow,
  ClientRow,
  ProjectStatus,
} from "@/features/freelance/types";
import { FreelanceView } from "@/features/freelance/freelance-view";

import { Card, CardContent } from "@/components/ui/card";

export default async function FreelancesPage() {
  // 👇 1. Descobre quem está acessando a página
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // 👇 2. Busca apenas os dados vinculados a esse usuário!
  const [projectsRaw, clientsRaw] = await Promise.all([
    prisma.project.findMany({
      where: { userId: userId }, // 👈 O Filtro Mágico dos Projetos
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
        transactions: {
          where: { source: "FREELANCE" },
          orderBy: { date: "desc" },
          select: { id: true, amount: true, date: true, note: true },
        },
      },
    }),
    prisma.client.findMany({
      where: { userId: userId }, // 👈 O Filtro Mágico dos Clientes
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true } } },
    }),
  ]);

  const projects: ProjectRow[] = projectsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    clientName: p.client.name,
    totalValue: Number(p.totalValue),
    receivedValue: Number(p.receivedValue),
    status: p.status as ProjectStatus,
    startDate: p.startDate.toISOString(),
    dueDate: p.dueDate ? p.dueDate.toISOString() : null,
    note: p.note,
    payments: p.transactions.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      note: t.note,
    })),
  }));

  const clients: ClientRow[] = clientsRaw.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    phone: c.phone,
    email: c.email,
    note: c.note,
    projectCount: c._count.projects,
  }));

  // Agregados
  const totalReceived = projects.reduce((s, p) => s + p.receivedValue, 0);
  const totalPending = projects
    .filter((p) => p.status === "IN_PROGRESS" || p.status === "PAUSED")
    .reduce((s, p) => s + (p.totalValue - p.receivedValue), 0);
  const activeCount = projects.filter(
    (p) => p.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="A receber" value={totalPending} accent="text-amber-500" />
        <SummaryCard
          label="Total recebido"
          value={totalReceived}
          accent="text-emerald-500"
        />
        <CountCard label="Projetos ativos" value={activeCount} />
      </div>

      <FreelanceView projects={projects} clients={clients} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent}`}>
          {formatBRL(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}