"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit2, Save, X, UserX, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { useETLStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Docente } from "@/lib/types";

interface DocenteWithSaldo extends Docente {
  saldo: number;
}

function formatSaldo(saldo: number): string {
  return saldo.toFixed(2);
}

function getSaldoColor(saldo: number): string {
  if (saldo < -1) return "text-red-600";
  if (saldo > 2) return "text-green-600";
  return "text-foreground";
}

export default function DocentesPage() {
  const { docentes, saldos, updateDocente, updateSaldo } = useETLStore();
  const [mounted, setMounted] = useState(false);
  const [editingDocente, setEditingDocente] = useState<DocenteWithSaldo | null>(
    null
  );
  const [formData, setFormData] = useState<DocenteWithSaldo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const docentesWithSaldo: DocenteWithSaldo[] = docentes.map((d) => ({
    ...d,
    saldo: saldos[d.nome] || 0,
  }));

  const handleEdit = (docente: DocenteWithSaldo) => {
    setEditingDocente(docente);
    setFormData({ ...docente });
  };

  const handleSave = () => {
    if (!formData || !editingDocente) return;

    updateDocente(editingDocente.nome, {
      ativo: formData.ativo,
      comentario: formData.comentario,
      agrupar: formData.agrupar,
    });

    if (formData.saldo !== editingDocente.saldo) {
      updateSaldo(editingDocente.nome, formData.saldo);
    }

    toast.success("Docente atualizado!", {
      description: `Os dados de ${editingDocente.nome} foram salvos.`,
    });

    setEditingDocente(null);
    setFormData(null);
  };

  const handleCancel = () => {
    setEditingDocente(null);
    setFormData(null);
  };

  const toggleAtivo = (docente: DocenteWithSaldo) => {
    updateDocente(docente.nome, { ativo: !docente.ativo });
    toast.success(
      docente.ativo ? "Docente desativado" : "Docente ativado",
      {
        description: `${docente.nome} foi ${
          docente.ativo ? "desativado" : "ativado"
        }.`,
      }
    );
  };

  const columns: Column<DocenteWithSaldo>[] = [
    {
      key: "nome",
      header: "Nome",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.nome}</span>
          {!item.ativo && (
            <Badge variant="secondary" className="text-xs">
              Inativo
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "saldo",
      header: "Saldo",
      render: (item) => (
        <span className={`font-medium font-mono ${getSaldoColor(item.saldo)}`}>
          {formatSaldo(item.saldo)}
        </span>
      ),
    },
    {
      key: "agrupar",
      header: "Agrupamento",
      render: (item) =>
        item.agrupar ? (
          <Badge variant="outline">{item.agrupar}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "comentario",
      header: "Comentário",
      render: (item) => (
        <span className="line-clamp-1 max-w-xs text-sm text-muted-foreground">
          {item.comentario || "-"}
        </span>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      render: (item) => (
        <Badge variant={item.ativo ? "default" : "secondary"}>
          {item.ativo ? "Ativo" : "Inativo"}
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
                <p>Editar docente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleAtivo(item)}
                  className="cursor-pointer"
                >
                  {item.ativo ? (
                    <UserX className="h-4 w-4 text-destructive" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.ativo ? "Desativar docente" : "Ativar docente"}</p>
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
          title="Gestão de Docentes"
          breadcrumbs={[{ label: "Docentes" }]}
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
        title="Gestão de Docentes"
        description={`${docentes.length} docente(s) cadastrado(s)`}
        breadcrumbs={[{ label: "Docentes" }]}
      />

      <main className="flex-1 p-6">
        <DataTable
          data={docentesWithSaldo}
          columns={columns}
          keyExtractor={(item) => item.nome}
          emptyMessage="Nenhum docente cadastrado. Importe a planilha de docentes primeiro."
          searchPlaceholder="Buscar por nome, agrupamento..."
        />

        {/* Modal de Edição */}
        <Dialog open={!!editingDocente} onOpenChange={handleCancel}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Docente</DialogTitle>
              <DialogDescription>
                Ajuste os dados do docente{" "}
                <strong>{editingDocente?.nome}</strong>
              </DialogDescription>
            </DialogHeader>

            {formData && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo</Label>
                  <Input
                    id="saldo"
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        saldo: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agrupar">Agrupamento (Preferência)</Label>
                  <Input
                    id="agrupar"
                    value={formData.agrupar}
                    onChange={(e) =>
                      setFormData({ ...formData, agrupar: e.target.value })
                    }
                    placeholder="Ex: grupo_1, manhã, tarde"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comentario">Comentário</Label>
                  <Textarea
                    id="comentario"
                    value={formData.comentario}
                    onChange={(e) =>
                      setFormData({ ...formData, comentario: e.target.value })
                    }
                    placeholder="Observações sobre preferências ou restrições"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="ativo">Status Ativo</Label>
                    <p className="text-xs text-muted-foreground">
                      Docentes inativos não são incluídos na exportação
                    </p>
                  </div>
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, ativo: checked })
                    }
                  />
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
