"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Link2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { useETLStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CruzamentoTurma } from "@/lib/types";

type StatusFilter = "todos" | "vinculado" | "pendente" | "erro";

export default function CruzamentosPage() {
  const {
    cruzamentos,
    disciplinas,
    updateCruzamento,
    updateFormulario,
    deleteCruzamento,
  } = useETLStore();
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [editingCruzamento, setEditingCruzamento] =
    useState<CruzamentoTurma | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [deletingCruzamento, setDeletingCruzamento] =
    useState<CruzamentoTurma | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCruzamentos = useMemo(() => {
    if (statusFilter === "todos") return cruzamentos;
    return cruzamentos.filter((c) => c.status === statusFilter);
  }, [cruzamentos, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      todos: cruzamentos.length,
      vinculado: cruzamentos.filter((c) => c.status === "vinculado").length,
      pendente: cruzamentos.filter((c) => c.status === "pendente").length,
      erro: cruzamentos.filter((c) => c.status === "erro").length,
    };
  }, [cruzamentos]);

  const handleFixCruzamento = (cruzamento: CruzamentoTurma) => {
    setEditingCruzamento(cruzamento);
    setSelectedDisciplina(cruzamento.disciplinaId || "");
  };

  const handleSave = () => {
    if (!editingCruzamento || !selectedDisciplina) return;

    // Atualiza o cruzamento
    updateCruzamento(editingCruzamento.id, selectedDisciplina);

    // Atualiza o formulário do docente
    // Remove a chave antiga se existir e adiciona a nova
    if (editingCruzamento.chaveNormalizada !== selectedDisciplina) {
      updateFormulario(
        editingCruzamento.docente,
        editingCruzamento.chaveNormalizada || editingCruzamento.chaveOriginal,
        null,
      );
      updateFormulario(
        editingCruzamento.docente,
        selectedDisciplina,
        editingCruzamento.prioridade,
      );
    }

    toast.success("Cruzamento corrigido!", {
      description: `A turma foi vinculada a ${selectedDisciplina}.`,
    });

    setEditingCruzamento(null);
    setSelectedDisciplina("");
  };

  const handleCancel = () => {
    setEditingCruzamento(null);
    setSelectedDisciplina("");
  };

  const handleConfirmDelete = () => {
    if (!deletingCruzamento) return;
    deleteCruzamento(deletingCruzamento.id);
    toast.success("Cruzamento removido!", {
      description: `O cruzamento de "${deletingCruzamento.docente}" para "${deletingCruzamento.chaveOriginal}" foi excluído.`,
    });
    setDeletingCruzamento(null);
  };

  const getStatusIcon = (status: CruzamentoTurma["status"]) => {
    switch (status) {
      case "vinculado":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pendente":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "erro":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: CruzamentoTurma["status"]) => {
    switch (status) {
      case "vinculado":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Vinculado
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Pendente
          </Badge>
        );
      case "erro":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Erro
          </Badge>
        );
    }
  };

  const columns: Column<CruzamentoTurma>[] = [
    {
      key: "status",
      header: "Status",
      searchable: false,
      render: (item) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(item.status)}
          {getStatusBadge(item.status)}
        </div>
      ),
    },
    {
      key: "docente",
      header: "Docente",
      render: (item) => <span className="font-medium">{item.docente}</span>,
    },
    {
      key: "chaveOriginal",
      header: "Chave Original",
      render: (item) => (
        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
          {item.chaveOriginal}
        </code>
      ),
    },
    {
      key: "chaveNormalizada",
      header: "Chave Normalizada",
      render: (item) => (
        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
          {item.chaveNormalizada || "-"}
        </code>
      ),
    },
    {
      key: "disciplinaId",
      header: "Turma Vinculada",
      render: (item) =>
        item.disciplinaId ? (
          <Badge variant="outline">{item.disciplinaId}</Badge>
        ) : (
          <span className="text-muted-foreground">Não vinculada</span>
        ),
    },
    {
      key: "prioridade",
      header: "Prioridade",
      render: (item) => (
        <span className="font-mono text-sm">{item.prioridade}</span>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      searchable: false,
      render: (item) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={item.status === "erro" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleFixCruzamento(item)}
                  className="cursor-pointer"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {item.status === "vinculado" ? "Alterar" : "Vincular"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {item.status === "vinculado"
                    ? "Alterar turma vinculada"
                    : "Vincular a uma turma"}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingCruzamento(item)}
                  className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir cruzamento</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Revisão de Cruzamentos"
          breadcrumbs={[{ label: "Cruzamentos" }]}
        />
        <main className="flex-1 p-6">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Revisão de Cruzamentos"
        description="Corrija vinculações entre turmas do formulário e disciplinas"
        breadcrumbs={[{ label: "Cruzamentos" }]}
      />

      <main className="flex-1 space-y-6 p-6">
        {/* Cards de Resumo */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              statusFilter === "todos" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setStatusFilter("todos")}
          >
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{statusCounts.todos}</CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              statusFilter === "vinculado" ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => setStatusFilter("vinculado")}
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Vinculados
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {statusCounts.vinculado}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              statusFilter === "pendente" ? "ring-2 ring-yellow-500" : ""
            }`}
            onClick={() => setStatusFilter("pendente")}
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Pendentes
              </CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {statusCounts.pendente}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              statusFilter === "erro" ? "ring-2 ring-red-500" : ""
            }`}
            onClick={() => setStatusFilter("erro")}
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Com Erro
              </CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {statusCounts.erro}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filtro e Tabela */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Cruzamentos</CardTitle>
                <CardDescription>
                  {statusFilter === "todos"
                    ? "Mostrando todos os cruzamentos"
                    : `Filtrado por: ${statusFilter}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="vinculado">Vinculados</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="erro">Com Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredCruzamentos}
              columns={columns}
              keyExtractor={(item) => item.id}
              emptyMessage={
                statusFilter === "todos"
                  ? "Nenhum cruzamento encontrado. Importe os formulários primeiro."
                  : `Nenhum cruzamento com status "${statusFilter}".`
              }
              searchPlaceholder="Buscar por docente, chave..."
            />
          </CardContent>
        </Card>

        {/* Diálogo de Confirmação de Exclusão */}
        <AlertDialog
          open={!!deletingCruzamento}
          onOpenChange={(open) => {
            if (!open) setDeletingCruzamento(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cruzamento?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  Esta ação removerá permanentemente o cruzamento e a entrada
                  correspondente no formulário do docente.
                </span>
                {deletingCruzamento && (
                  <span className="block rounded-md border bg-muted p-3 text-sm">
                    <span className="block">
                      <span className="text-muted-foreground">Docente: </span>
                      <span className="font-medium">
                        {deletingCruzamento.docente}
                      </span>
                    </span>
                    <span className="block">
                      <span className="text-muted-foreground">Turma: </span>
                      <code className="font-mono text-xs">
                        {deletingCruzamento.chaveOriginal}
                      </code>
                    </span>
                    <span className="block">
                      <span className="text-muted-foreground">
                        Prioridade:{" "}
                      </span>
                      <span className="font-mono">
                        {deletingCruzamento.prioridade}
                      </span>
                    </span>
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4 " />
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Correção */}
        <Dialog open={!!editingCruzamento} onOpenChange={handleCancel}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Vincular Turma</DialogTitle>
              <DialogDescription>
                Selecione a disciplina correta para vincular à chave{" "}
                <code className="rounded bg-muted px-1">
                  {editingCruzamento?.chaveOriginal}
                </code>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Docente:</span>
                  <span className="font-medium">
                    {editingCruzamento?.docente}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chave Original:</span>
                  <code className="text-xs">
                    {editingCruzamento?.chaveOriginal}
                  </code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prioridade:</span>
                  <span className="font-mono">
                    {editingCruzamento?.prioridade}
                  </span>
                </div>
                {editingCruzamento?.erro && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Erro:</span>
                    <span className="text-red-600 text-xs">
                      {editingCruzamento.erro}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="disciplina">Selecione a Disciplina</Label>
                <Select
                  value={selectedDisciplina}
                  onValueChange={setSelectedDisciplina}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma disciplina..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {disciplinas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{d.id}</code>
                          <span className="text-muted-foreground">-</span>
                          <span className="truncate">{d.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!selectedDisciplina}>
                <Link2 className="mr-2 h-4 w-4" />
                Vincular
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
