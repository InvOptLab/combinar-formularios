"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FileDropzone } from "@/components/file-dropzone";
import { useETLStore } from "@/lib/store";
import {
  processDisciplinasJSON,
  processDocentesXLSX,
  processFormularios,
} from "@/lib/processor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DisciplinaRaw, FormularioRaw, Disciplina } from "@/lib/types";

export default function ImportacaoPage() {
  const {
    setDisciplinas,
    setDocentes,
    setSaldos,
    setFormularios,
    setCruzamentos,
    importStatus,
    setImportStatus,
    disciplinas,
    docentes,
    resetAll,
  } = useETLStore();

  const [disciplinasStatus, setDisciplinasStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(importStatus.disciplinas);
  const [docentesStatus, setDocentesStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(importStatus.docentes);
  const [formulariosStatus, setFormulariosStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(importStatus.formularios);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handler para Disciplinas
  const handleDisciplinasUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setDisciplinasStatus("loading");
      setImportStatus("disciplinas", "loading");
      setErrorMessage("");

      try {
        const file = files[0];
        const text = await file.text();
        const rawData: DisciplinaRaw[] = JSON.parse(text);
        console.log(rawData);

        const processedDisciplinas = processDisciplinasJSON(rawData);
        setDisciplinas(processedDisciplinas);

        setDisciplinasStatus("success");
        toast.success("Disciplinas importadas!", {
          description: `${processedDisciplinas.length} disciplinas carregadas com sucesso.`,
        });
      } catch (error) {
        console.error("Error processing disciplinas:", error);
        setDisciplinasStatus("error");
        setImportStatus("disciplinas", "error");
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao processar arquivo",
        );
        toast.error("Erro na importação", {
          description: "Verifique se o arquivo JSON está no formato correto.",
        });
      }
    },
    [setDisciplinas, setImportStatus],
  );

  // Handler para Docentes (XLSX)
  const handleDocentesUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setDocentesStatus("loading");
      setImportStatus("docentes", "loading");
      setErrorMessage("");

      try {
        const file = files[0];
        const buffer = await file.arrayBuffer();
        const { docentes: processedDocentes, saldos } =
          processDocentesXLSX(buffer);

        setDocentes(processedDocentes);
        setSaldos(saldos);

        setDocentesStatus("success");
        toast.success("Docentes importados!", {
          description: `${processedDocentes.length} docentes e seus saldos carregados.`,
        });
      } catch (error) {
        console.error("Error processing docentes:", error);
        setDocentesStatus("error");
        setImportStatus("docentes", "error");
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao processar arquivo",
        );
        toast.error("Erro na importação", {
          description: "Verifique se a planilha Excel está no formato correto.",
        });
      }
    },
    [setDocentes, setSaldos, setImportStatus],
  );

  // Handler para Formulários
  const handleFormulariosUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      if (disciplinas.length === 0) {
        toast.error("Importe as disciplinas primeiro!", {
          description:
            "Os formulários precisam das disciplinas para fazer o cruzamento.",
        });
        return;
      }

      setFormulariosStatus("loading");
      setImportStatus("formularios", "loading");
      setErrorMessage("");

      try {
        // Cria mapa de disciplinas para lookup rápido
        const disciplinasMap = new Map<string, Disciplina>();
        disciplinas.forEach((d) => disciplinasMap.set(d.id, d));

        // Processa todos os arquivos
        const filesData: { name: string; data: FormularioRaw }[] = [];

        console.log(filesData);

        for (const file of files) {
          const text = await file.text();
          const data = JSON.parse(text);
          filesData.push({ name: file.name, data });
        }

        const { formularios, cruzamentos, docentesAvaliacao } =
          processFormularios(filesData, disciplinasMap);

        // Atualiza os docentes com comentário e preferência
        const updatedDocentes = docentes.map((d) => {
          const avaliacaoInfo = docentesAvaliacao[d.nome];
          if (avaliacaoInfo) {
            return {
              ...d,
              comentario: avaliacaoInfo.comentario || d.comentario,
              agrupar: avaliacaoInfo.preferencia || d.agrupar,
            };
          }
          return d;
        });

        setDocentes(updatedDocentes);
        setFormularios(formularios);
        setCruzamentos(cruzamentos);

        const erros = cruzamentos.filter((c) => c.status === "erro").length;
        const vinculados = cruzamentos.filter(
          (c) => c.status === "vinculado",
        ).length;

        setFormulariosStatus("success");
        toast.success("Formulários processados!", {
          description: `${files.length} arquivo(s) processado(s). ${vinculados} turmas vinculadas, ${erros} com erro.`,
        });

        if (erros > 0) {
          toast.warning("Atenção!", {
            description: `${erros} cruzamento(s) precisam de revisão manual.`,
          });
        }
      } catch (error) {
        console.error("Error processing formularios:", error);
        setFormulariosStatus("error");
        setImportStatus("formularios", "error");
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao processar arquivos",
        );
        toast.error("Erro na importação", {
          description:
            "Verifique se os arquivos JSON estão no formato correto.",
        });
      }
    },
    [
      disciplinas,
      docentes,
      setDocentes,
      setFormularios,
      setCruzamentos,
      setImportStatus,
    ],
  );

  const handleReset = () => {
    resetAll();
    setDisciplinasStatus("idle");
    setDocentesStatus("idle");
    setFormulariosStatus("idle");
    toast.info("Dados resetados", {
      description: "Todos os dados foram limpos do sistema.",
    });
  };

  return (
    <>
      <PageHeader
        title="Importação de Dados"
        description="Carregue os arquivos de entrada para o sistema"
        breadcrumbs={[{ label: "Importação" }]}
        actions={
          <Button
            variant="outline"
            onClick={handleReset}
            className="cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar Tudo
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <Alert className="mb-6">
          <AlertTitle>Ordem de importação recomendada</AlertTitle>
          <AlertDescription className="block">
            Importe primeiro as <strong>Disciplinas</strong>, depois os{" "}
            <strong>Docentes</strong>, e por último os{" "}
            <strong>Formulários</strong>. <br></br>
            Os formulários dependem das disciplinas para realizar o cruzamento
            de dados.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="disciplinas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="disciplinas" className="relative">
              Disciplinas
              {disciplinasStatus === "success" && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="docentes" className="relative">
              Docentes
              {docentesStatus === "success" && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="formularios" className="relative">
              Formulários
              {formulariosStatus === "success" && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Disciplinas Tab */}
          <TabsContent value="disciplinas">
            <Card>
              <CardHeader>
                <CardTitle>Disciplinas (Turmas)</CardTitle>
                <CardDescription>
                  Arquivo JSON contendo a lista de disciplinas/turmas
                  disponíveis. Exemplo: turmas.json
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileDropzone
                  accept=".json"
                  title="Arraste o arquivo JSON de disciplinas"
                  description="Aceita apenas arquivos .json com a estrutura de disciplinas"
                  onFilesSelected={handleDisciplinasUpload}
                  isLoading={disciplinasStatus === "loading"}
                  status={disciplinasStatus}
                  errorMessage={errorMessage}
                />

                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Estrutura esperada:</p>
                  <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                    {`[
                        {
                          "id": "SME0320,1",
                          "nome": "Cálculo I",
                          "curso": "Engenharia",
                          "semestre": "2026-1",
                          "horarios": [
                            { "dia": "Ter.", "inicio": "10:10", "fim": "11:50" },
                            { "dia": "Qui.", "inicio": "14:20", "fim": "16:00" }
                          ]
                        },
                        ...
                      ]`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Docentes Tab */}
          <TabsContent value="docentes">
            <Card>
              <CardHeader>
                <CardTitle>Docentes e Saldos</CardTitle>
                <CardDescription>
                  Planilha Excel (.xlsx) com a listagem de docentes. O sistema
                  extrairá os nomes da coluna &quot;Docente&quot; e os saldos da
                  coluna &quot;Novo Saldo&quot;.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileDropzone
                  accept=".xlsx,.xls"
                  title="Arraste a planilha de docentes"
                  description="Aceita arquivos Excel (.xlsx, .xls)"
                  onFilesSelected={handleDocentesUpload}
                  isLoading={docentesStatus === "loading"}
                  status={docentesStatus}
                  errorMessage={errorMessage}
                />

                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Colunas esperadas:</p>
                  <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                    <li>
                      <strong>Docente</strong>: Nome do docente
                    </li>
                    <li>
                      <strong>Carga</strong>: Usado para filtrar linhas válidas
                    </li>
                    <li>
                      <strong>Novo Saldo</strong>: Saldo de créditos do docente
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formulários Tab */}
          <TabsContent value="formularios">
            <Card>
              <CardHeader>
                <CardTitle>Formulários de Intenção</CardTitle>
                <CardDescription>
                  Múltiplos arquivos JSON, um por docente. Cada arquivo contém
                  as preferências de turmas e prioridades atribuídas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileDropzone
                  accept=".json"
                  multiple
                  title="Arraste os arquivos JSON de formulários"
                  description="Aceita múltiplos arquivos .json (um por docente)"
                  onFilesSelected={handleFormulariosUpload}
                  isLoading={formulariosStatus === "loading"}
                  status={formulariosStatus}
                  errorMessage={errorMessage}
                />

                <div className="mt-4 rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">
                    Estrutura esperada (por arquivo):
                  </p>
                  <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                    {`{
                        "Nome do Docente": {
                          "avaliacao": { ... },
                          "comentario": "Preferência por manhã",
                          "preferencia": "grupo_1",
                          "formularios": {
                            "SME0320,1.0": 10,
                            "SME0321,2": 8
                          }
                        }
                      }`}
                  </pre>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <strong>Nota:</strong> As chaves como
                    &quot;SME0320,1.0&quot; serão normalizadas automaticamente
                    para &quot;SME0320,1&quot;.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
