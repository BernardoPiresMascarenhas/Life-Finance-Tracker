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
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          <ClientDialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Cliente
              </Button>
            </DialogTrigger>
          </ClientDialog>
          <ProjectDialog clients={clientOptions}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Projeto
              </Button>
            </DialogTrigger>
          </ProjectDialog>
        </div>
      </div>

      <TabsContent value="projects">
        {projects.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-5 w-5 text-muted-foreground" />}
            title="Nenhum projeto ainda"
            subtitle="Crie um projeto para começar a controlar recebimentos."
          />
        ) : (
          <ProjectsTable rows={projects} clients={clientOptions} />
        )}
      </TabsContent>

      <TabsContent value="clients">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            title="Nenhum cliente ainda"
            subtitle="Cadastre um cliente para vincular aos seus projetos."
          />
        ) : (
          <ClientsTable rows={clients} />
        )}
      </TabsContent>
    </Tabs>
  );
}

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
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
