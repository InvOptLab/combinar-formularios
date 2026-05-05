"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Edit2, Save, X, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { useETLStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PrioridadeItem {
  id: string;
  docente: string;
  turmaId: string;
  prioridade: number;
}

export default function PrioridadesPage() {
  const { formularios, docentes, disciplinas, updateFormulario, saldos } =
    useETLStore();
  const [mounted, setMounted] = useState(false);
  const [docenteFilter, setDocenteFilter] = useState<string>("todos");
  const [editingItem, setEditingItem] = useState<PrioridadeItem | null>(null);
  const [newPrioridade, setNewPrioridade] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Monta lista de prioridades a partir dos formulários
  const prioridades = useMemo(() => {
    const items: PrioridadeItem[] = [];
    let idCounter = 0;

    for (const [docente, turmas] of Object.entries(formularios)) {
      for (const [turmaId, prioridade] of Object.entries(turmas)) {
        items.push({
          id: `${idCounter++}`,
          docente,
          turmaId,
          prioridade,
        });
      }
    }

    return items;
  }, [formularios]);

  const filteredPrioridades = useMemo(() => {
    if (docenteFilter === "todos") return prioridades;
    return prioridades.filter((p) => p.docente === docenteFilter);
  }, [prioridades, docenteFilter]);

  const docentesComFormulario = useMemo(() => {
    return Object.keys(formularios).sort();
  }, [formularios]);

  const handleEdit = (item: PrioridadeItem) => {
    setEditingItem(item);
    setNewPrioridade(item.prioridade);
  };

  const handleSave = () => {
    if (!editingItem) return;

    updateFormulario(editingItem.docente, editingItem.turmaId, newPrioridade);

    toast.success("Prioridade atualizada!", {
      description: `A prioridade de ${editingItem.docente} para ${editingItem.turmaId} foi alterada para ${newPrioridade}.`,
    });

    setEditingItem(null);
    setNewPrioridade(0);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setNewPrioridade(0);
  };

  function formatSaldo(saldo: number): string {
    return saldo.toFixed(2);
  }

  function getSaldoColor(saldo: number): string {
    if (saldo < -1) return "text-red-600";
    if (saldo > 2) return "text-green-600";
    return "text-foreground";
  }

  const columns: Column<PrioridadeItem>[] = [
    {
      key: "docente",
      header: "Docente",
      render: (item) => {
        const saldo = saldos[item.docente] || 0;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{item.docente}</span>
            <span className={`text-xs font-mono ${getSaldoColor(saldo)}`}>
              Saldo: {formatSaldo(saldo)}
            </span>
          </div>
        );
      },
    },
    {
      key: "turmaId",
      header: "Turma",
      render: (item) => {
        const disciplina = disciplinas.find((d) => d.id === item.turmaId);
        return (
          <div className="flex flex-col">
            <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
              {item.turmaId}
            </code>
            {disciplina && (
              <span className="text-xs text-muted-foreground mt-1">
                {disciplina.nome}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "prioridade",
      header: "Prioridade",
      render: (item) => (
        <Badge variant="outline" className="font-mono">
          {item.prioridade}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      searchable: false,
      render: (item) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(item)}
                className="cursor-pointer"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar prioridade</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ];

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Gestão de Prioridades"
          breadcrumbs={[{ label: "Prioridades" }]}
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
        title="Gestão de Prioridades"
        description={`${prioridades.length} prioridade(s) cadastrada(s) de ${docentesComFormulario.length} docente(s)`}
        breadcrumbs={[{ label: "Prioridades" }]}
      />

      <main className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Prioridades</CardTitle>
                <CardDescription>
                  Visualize e edite as prioridades informadas pelos docentes nos formulários
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={docenteFilter}
                  onValueChange={setDocenteFilter}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Filtrar por docente" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="todos">Todos os docentes</SelectItem>
                    {docentesComFormulario.map((docente) => (
                      <SelectItem key={docente} value={docente}>
                        {docente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredPrioridades}
              columns={columns}
              keyExtractor={(item) => `${item.docente}-${item.turmaId}`}
              emptyMessage={
                docenteFilter === "todos"
                  ? "Nenhuma prioridade encontrada. Importe os formulários primeiro."
                  : `Nenhuma prioridade encontrada para o docente "${docenteFilter}".`
              }
              searchPlaceholder="Buscar por docente, turma..."
            />
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <Dialog open={!!editingItem} onOpenChange={handleCancel}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Prioridade</DialogTitle>
              <DialogDescription>
                Ajuste a prioridade informada pelo docente para esta turma
              </DialogDescription>
            </DialogHeader>

            {editingItem && (
              <div className="space-y-4 py-4">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Docente:</span>
                    <span className="font-medium">{editingItem.docente}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Turma:</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      {editingItem.turmaId}
                    </code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Prioridade Atual:
                    </span>
                    <span className="font-mono">{editingItem.prioridade}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Nova Prioridade</Label>
                  <Input
                    id="prioridade"
                    type="number"
                    step="1"
                    value={newPrioridade}
                    onChange={(e) =>
                      setNewPrioridade(parseFloat(e.target.value) || 0)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Valores maiores indicam maior preferência do docente pela turma.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} className="cursor-pointer">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="cursor-pointer">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
