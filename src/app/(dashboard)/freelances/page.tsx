import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Clock, CheckCircle, Briefcase } from "lucide-react";

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
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [projectsRaw, clientsRaw] = await Promise.all([
    prisma.project.findMany({
      where: { userId: userId }, 
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
      where: { userId: userId }, 
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

  const totalReceived = projects.reduce((s, p) => s + p.receivedValue, 0);
  const totalPending = projects
    .filter((p) => p.status === "IN_PROGRESS" || p.status === "PAUSED")
    .reduce((s, p) => s + (p.totalValue - p.receivedValue), 0);
  const activeCount = projects.filter(
    (p) => p.status === "IN_PROGRESS"
  ).length;

  return (
    // 👇 Espaçamento dinâmico: space-y-6 no mobile, space-y-8 no PC
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 p-4 md:p-8">
      
      <div className="flex flex-col gap-1">
        {/* 👇 Fontes adaptáveis no cabeçalho */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Serviços</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie seus serviços prestados, contratos e clientes.
        </p>
      </div>

      <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-3">
        <SummaryCard 
          label="A receber" 
          value={totalPending} 
          accent="text-amber-500" 
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />
        <SummaryCard
          label="Total recebido"
          value={totalReceived}
          accent="text-emerald-500"
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
        />
        <CountCard 
          label="Serviços ativos" 
          value={activeCount} 
          icon={<Briefcase className="h-5 w-5 text-blue-500" />}
        />
      </div>

      <FreelanceView projects={projects} clients={clients} />
      
    </div>
  );
}

// 👇 Componentes ajustados para mobile
function SummaryCard({
  label,
  value,
  icon,
  accent = "text-foreground",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      {/* 👇 Padding responsivo */}
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">
            {label}
          </p>
          {/* 👇 Ícone levemente menor no celular */}
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-secondary/50">
            {icon}
          </div>
        </div>
        <div>
          {/* 👇 Texto do valor responsivo */}
          <p className={`text-2xl md:text-3xl font-bold tracking-tight tabular-nums ${accent}`}>
            {formatBRL(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CountCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">
            {label}
          </p>
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-secondary/50">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}