"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit2, Save, X, Users, Plus, Trash2 } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Disciplina, Horario } from "@/lib/types";

function formatSaldo(saldo: number): string {
  return saldo.toFixed(2);
}

function getSaldoColor(saldo: number): string {
  if (saldo < -1) return "text-red-600";
  if (saldo > 2) return "text-green-600";
  return "text-foreground";
}

function formatHorarios(horarios?: Horario[]): string {
  if (!horarios || horarios.length === 0) return "-";
  return horarios.map((h) => `${h.dia} ${h.inicio}-${h.fim}`).join(", ");
}

interface DocenteInteressado {
  nome: string;
  saldo: number;
  prioridade: number;
}

export default function DisciplinasPage() {
  const { disciplinas, updateDisciplina, formularios, saldos } = useETLStore();
  const [mounted, setMounted] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(
    null
  );
  const [formData, setFormData] = useState<Disciplina | null>(null);
  const [viewingInteressados, setViewingInteressados] = useState<{
    disciplina: Disciplina;
    interessados: DocenteInteressado[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcula quantos docentes pediram cada disciplina
  const disciplinasWithCount = disciplinas.map((d) => {
    const docentesInteressados: DocenteInteressado[] = [];
    for (const [docente, turmas] of Object.entries(formularios)) {
      const prioridade = turmas[d.id];
      if (prioridade !== undefined) {
        docentesInteressados.push({
          nome: docente,
          saldo: saldos[docente] || 0,
          prioridade,
        });
      }
    }
    return {
      ...d,
      totalInteressados: docentesInteressados.length,
      docentesInteressados,
    };
  });

  const handleEdit = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setFormData({ ...disciplina });
  };

  const handleViewInteressados = (
    disciplina: Disciplina,
    interessados: DocenteInteressado[]
  ) => {
    setViewingInteressados({ disciplina, interessados });
  };

  const handleSave = () => {
    if (!formData || !editingDisciplina) return;

    updateDisciplina(editingDisciplina.id, formData);

    toast.success("Disciplina atualizada!", {
      description: `Os dados de ${formData.nome} foram salvos.`,
    });

    setEditingDisciplina(null);
    setFormData(null);
  };

  const handleCancel = () => {
    setEditingDisciplina(null);
    setFormData(null);
  };

  const handleCloseInteressados = () => {
    setViewingInteressados(null);
  };

  const addHorario = () => {
    if (!formData) return;
    const newHorarios = [...(formData.horarios || []), { dia: "", inicio: "", fim: "" }];
    setFormData({ ...formData, horarios: newHorarios });
  };

  const updateHorario = (index: number, field: keyof Horario, value: string) => {
    if (!formData || !formData.horarios) return;
    const newHorarios = [...formData.horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setFormData({ ...formData, horarios: newHorarios });
  };

  const removeHorario = (index: number) => {
    if (!formData || !formData.horarios) return;
    const newHorarios = formData.horarios.filter((_, i) => i !== index);
    setFormData({ ...formData, horarios: newHorarios });
  };

  type DisciplinaWithCount = (typeof disciplinasWithCount)[number];

  const columns: Column<DisciplinaWithCount>[] = [
    {
      key: "id",
      header: "ID",
      render: (item) => (
        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
          {item.id}
        </code>
      ),
    },
    {
      key: "nome",
      header: "Nome",
      render: (item) => <span className="font-medium">{item.nome}</span>,
    },
    {
      key: "cursos",
      header: "Curso",
      render: (item) => <Badge variant="outline">{item.cursos}</Badge>,
    },
    {
      key: "semestre",
      header: "Semestre",
      render: (item) => (
        <span className="text-muted-foreground">{item.semestre || "-"}</span>
      ),
    },
    {
      key: "horarios",
      header: "Horários",
      render: (item) => (
        <span className="text-muted-foreground text-sm">
          {formatHorarios(item.horarios)}
        </span>
      ),
    },
    {
      key: "totalInteressados",
      header: "Interessados",
      searchable: false,
      render: (item) => (
        <Badge
          variant={item.totalInteressados > 0 ? "default" : "secondary"}
        >
          {item.totalInteressados}
        </Badge>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      searchable: false,
      render: (item) => (
        <div className="flex items-center gap-1">
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
                <p>Editar disciplina</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleViewInteressados(item, item.docentesInteressados)
                  }
                  disabled={item.totalInteressados === 0}
                  className="cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {item.totalInteressados > 0
                    ? "Ver docentes interessados"
                    : "Nenhum docente interessado"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Gestão de Disciplinas"
          breadcrumbs={[{ label: "Disciplinas" }]}
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
        title="Gestão de Disciplinas"
        description={`${disciplinas.length} disciplina(s) cadastrada(s)`}
        breadcrumbs={[{ label: "Disciplinas" }]}
      />

      <main className="flex-1 p-6">
        <DataTable
          data={disciplinasWithCount}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyMessage="Nenhuma disciplina cadastrada. Importe o arquivo JSON de disciplinas primeiro."
          searchPlaceholder="Buscar por ID, nome, curso..."
        />

        {/* Modal de Edição */}
        <Dialog open={!!editingDisciplina} onOpenChange={handleCancel}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Disciplina</DialogTitle>
              <DialogDescription>
                Ajuste os dados da disciplina{" "}
                <strong>{editingDisciplina?.id}</strong>
              </DialogDescription>
            </DialogHeader>

            {formData && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cursos">Curso</Label>
                  <Input
                    id="cursos"
                    value={formData.cursos}
                    onChange={(e) =>
                      setFormData({ ...formData, cursos: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input
                    id="semestre"
                    value={formData.semestre || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, semestre: e.target.value })
                    }
                    placeholder="Ex: 2026-1"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Horários</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHorario}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(formData.horarios || []).map((horario, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={horario.dia}
                          onChange={(e) =>
                            updateHorario(index, "dia", e.target.value)
                          }
                          placeholder="Dia (ex: Seg.)"
                          className="w-24"
                        />
                        <Input
                          value={horario.inicio}
                          onChange={(e) =>
                            updateHorario(index, "inicio", e.target.value)
                          }
                          placeholder="Início"
                          className="w-24"
                        />
                        <Input
                          value={horario.fim}
                          onChange={(e) =>
                            updateHorario(index, "fim", e.target.value)
                          }
                          placeholder="Fim"
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHorario(index)}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {(!formData.horarios || formData.horarios.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum horário cadastrado
                      </p>
                    )}
                  </div>
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

        {/* Modal de Docentes Interessados */}
        <Dialog open={!!viewingInteressados} onOpenChange={handleCloseInteressados}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Docentes Interessados</DialogTitle>
              <DialogDescription>
                Lista de docentes que solicitaram a turma{" "}
                <strong>{viewingInteressados?.disciplina.id}</strong> -{" "}
                {viewingInteressados?.disciplina.nome}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingInteressados?.interessados
                    .sort((a, b) => b.prioridade - a.prioridade)
                    .map((docente) => (
                      <TableRow key={docente.nome}>
                        <TableCell className="font-medium">
                          {docente.nome}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${getSaldoColor(
                            docente.saldo
                          )}`}
                        >
                          {formatSaldo(docente.saldo)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {docente.prioridade}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button onClick={handleCloseInteressados} className="cursor-pointer">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
