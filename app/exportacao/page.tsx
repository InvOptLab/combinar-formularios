"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Download,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Copy,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useETLStore } from "@/lib/store";
import { generateExportData } from "@/lib/processor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ExportData } from "@/lib/types";

export default function ExportacaoPage() {
  const { disciplinas, docentes, saldos, formularios, cruzamentos } =
    useETLStore();
  const [mounted, setMounted] = useState(false);
  const [previewData, setPreviewData] = useState<ExportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validationStatus = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (disciplinas.length === 0) {
      errors.push("Nenhuma disciplina importada");
    }

    if (docentes.length === 0) {
      errors.push("Nenhum docente importado");
    }

    const cruzamentosErro = cruzamentos.filter((c) => c.status === "erro");
    if (cruzamentosErro.length > 0) {
      warnings.push(
        `${cruzamentosErro.length} cruzamento(s) com erro não serão incluídos`
      );
    }

    const docentesSemFormulario = docentes.filter(
      (d) => !formularios[d.nome] || Object.keys(formularios[d.nome]).length === 0
    );
    if (docentesSemFormulario.length > 0) {
      warnings.push(
        `${docentesSemFormulario.length} docente(s) sem formulário de intenção`
      );
    }

    const docentesInativos = docentes.filter((d) => !d.ativo);
    if (docentesInativos.length > 0) {
      warnings.push(`${docentesInativos.length} docente(s) marcado(s) como inativo(s)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [disciplinas, docentes, formularios, cruzamentos]);

  const generatePreview = () => {
    setIsGenerating(true);

    // Simula um pequeno delay para feedback visual
    setTimeout(() => {
      const exportData = generateExportData(
        disciplinas,
        docentes.filter((d) => d.ativo), // Apenas docentes ativos
        saldos,
        formularios
      );
      setPreviewData(exportData);
      setIsGenerating(false);
      toast.success("Preview gerado!", {
        description: "Revise os dados antes de fazer o download.",
      });
    }, 500);
  };

  const handleDownload = () => {
    if (!previewData) {
      generatePreview();
      return;
    }

    const jsonString = JSON.stringify(previewData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `formularios_combinados_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Download iniciado!", {
      description: "O arquivo JSON foi gerado com sucesso.",
    });
  };

  const handleCopyToClipboard = async () => {
    if (!previewData) return;

    const jsonString = JSON.stringify(previewData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    toast.success("Copiado!", {
      description: "O JSON foi copiado para a área de transferência.",
    });
  };

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Exportação de Dados"
          breadcrumbs={[{ label: "Exportação" }]}
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
        title="Exportação de Dados"
        description="Gere o arquivo JSON consolidado para o algoritmo de otimização"
        breadcrumbs={[{ label: "Exportação" }]}
      />

      <main className="flex-1 space-y-6 p-6">
        {/* Validações */}
        {validationStatus.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Não é possível exportar</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-inside list-disc">
                {validationStatus.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validationStatus.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Avisos</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-inside list-disc">
                {validationStatus.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Cards de Resumo */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Versão</CardDescription>
              <CardTitle className="text-2xl">3.0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Disciplinas</CardDescription>
              <CardTitle className="text-2xl">{disciplinas.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Docentes Ativos</CardDescription>
              <CardTitle className="text-2xl">
                {docentes.filter((d) => d.ativo).length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Formulários</CardDescription>
              <CardTitle className="text-2xl">
                {Object.keys(formularios).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Ações e Preview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ações */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Exportar JSON
              </CardTitle>
              <CardDescription>
                Gere o arquivo consolidado no formato esperado pelo algoritmo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Estrutura do arquivo:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <code>versao</code>: &quot;3.0&quot;
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <code>formularios</code>: objeto com turmas por docente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <code>disciplinas</code>: array de objetos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <code>docentes</code>: array de objetos (ordenado)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <code>saldos</code>: objeto com saldos por docente
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full cursor-pointer"
                  onClick={generatePreview}
                  disabled={!validationStatus.isValid || isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  Gerar Preview
                </Button>

                <Button
                  className="w-full cursor-pointer"
                  variant="default"
                  onClick={handleDownload}
                  disabled={!validationStatus.isValid}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>

                {previewData && (
                  <Button
                    className="w-full cursor-pointer"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar para Clipboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview do JSON</CardTitle>
                  <CardDescription>
                    Visualize os dados antes de exportar
                  </CardDescription>
                </div>
                {previewData && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Pronto para download
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <Tabs defaultValue="full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="full">JSON Completo</TabsTrigger>
                    <TabsTrigger value="docentes">Docentes</TabsTrigger>
                    <TabsTrigger value="formularios">Formulários</TabsTrigger>
                    <TabsTrigger value="saldos">Saldos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="full">
                    <ScrollArea className="h-96 w-full rounded-md border">
                      <pre className="p-4 text-xs">
                        {JSON.stringify(previewData, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="docentes">
                    <ScrollArea className="h-96 w-full rounded-md border">
                      <pre className="p-4 text-xs">
                        {JSON.stringify(previewData.docentes, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="formularios">
                    <ScrollArea className="h-96 w-full rounded-md border">
                      <pre className="p-4 text-xs">
                        {JSON.stringify(previewData.formularios, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="saldos">
                    <ScrollArea className="h-96 w-full rounded-md border">
                      <pre className="p-4 text-xs">
                        {JSON.stringify(previewData.saldos, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex h-96 flex-col items-center justify-center rounded-md border border-dashed text-center">
                  <FileJson className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium">
                    Nenhum preview gerado
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clique em &quot;Gerar Preview&quot; para visualizar os dados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
