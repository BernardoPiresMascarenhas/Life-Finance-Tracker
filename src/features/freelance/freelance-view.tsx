"use client";

import { Plus, Briefcase, Users } from "lucide-react";

import type { ProjectRow, ClientRow, ClientOption } from "./types";
import { ProjectsTable } from "./projects-table";
import { ClientsTable } from "./clients-table";
import { ProjectDialog } from "./project-dialog";
import { ClientDialog } from "./client-dialog";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function FreelanceView({
  projects,
  clients,
}: {
  projects: ProjectRow[];
  clients: ClientRow[];
}) {
  const clientOptions: ClientOption[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <Tabs defaultValue="projects" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          {/* 👇 Mudamos o rótulo visual para "Serviços" */}
          <TabsTrigger value="projects">Serviços</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          <ClientDialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
          </ClientDialog>
          <ProjectDialog clients={clientOptions}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Serviço
              </Button>
            </DialogTrigger>
          </ProjectDialog>
        </div>
      </div>

      <TabsContent value="projects">
        {projects.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-6 w-6 text-muted-foreground" />}
            title="Nenhum serviço registrado"
            subtitle="Cadastre seu primeiro serviço ou contrato para começar a acompanhar os pagamentos."
          />
        ) : (
          <ProjectsTable rows={projects} clients={clientOptions} />
        )}
      </TabsContent>

      <TabsContent value="clients">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            title="Nenhum cliente cadastrado"
            subtitle="Cadastre um cliente para poder vinculá-lo aos seus serviços."
          />
        ) : (
          <ClientsTable rows={clients} />
        )}
      </TabsContent>
    </Tabs>
  );
}

// 👇 Atualizamos o EmptyState para combinar com a tela de Transações (design premium)
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Card className="border-dashed shadow-none mt-2">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/80">
          {icon}
        </div>
        <div>
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}