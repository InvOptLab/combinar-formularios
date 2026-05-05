"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Upload,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useETLStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AppStats } from "@/lib/types";

export default function DashboardPage() {
  const getStats = useETLStore((state) => state.getStats);
  const importStatus = useETLStore((state) => state.importStatus);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
  }, [getStats]);

  if (!mounted) {
    return (
      <>
        <PageHeader title="Dashboard" description="Visão geral do sistema" />
        <main className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </main>
      </>
    );
  }

  const totalCruzamentos =
    (stats?.cruzamentosVinculados || 0) +
    (stats?.cruzamentosPendentes || 0) +
    (stats?.cruzamentosErro || 0);

  const progressoImportacao = Math.round(
    [
      importStatus.disciplinas === "success",
      importStatus.docentes === "success",
      importStatus.formularios === "success",
    ].filter(Boolean).length * 33.33,
  );

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral do sistema ETL" />

      <main className="flex-1 space-y-6 p-6">
        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Disciplinas Cadastradas"
            value={stats?.totalDisciplinas || 0}
            icon={BookOpen}
            description="Total de turmas no sistema"
          />
          <StatCard
            title="Docentes"
            value={stats?.totalDocentes || 0}
            icon={Users}
            description="Docentes ativos e inativos"
          />
          <StatCard
            title="Formulários Processados"
            value={stats?.totalFormularios || 0}
            icon={FileText}
            description="Formulários de intenção"
          />
          <StatCard
            title="Cruzamentos Vinculados"
            value={stats?.cruzamentosVinculados || 0}
            icon={CheckCircle2}
            variant="success"
            description="Turmas vinculadas com sucesso"
          />
          <StatCard
            title="Cruzamentos Pendentes"
            value={stats?.cruzamentosPendentes || 0}
            icon={AlertTriangle}
            variant="warning"
            description="Aguardando revisão"
          />
          <StatCard
            title="Cruzamentos com Erro"
            value={stats?.cruzamentosErro || 0}
            icon={XCircle}
            variant="error"
            description="Necessitam correção manual"
          />
        </div>

        {/* Status de Importação e Ações Rápidas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Progresso da Importação */}
          <Card>
            <CardHeader>
              <CardTitle>Status de Importação</CardTitle>
              <CardDescription>
                Progresso do carregamento dos dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso Geral</span>
                  <span>{Math.round(progressoImportacao)}%</span>
                </div>
                <Progress value={progressoImportacao} className="h-2" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disciplinas (JSON)</span>
                  <StatusBadge status={importStatus.disciplinas} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Docentes e Saldos (XLSX)</span>
                  <StatusBadge status={importStatus.docentes} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Formulários de Intenção (JSON)
                  </span>
                  <StatusBadge status={importStatus.formularios} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Navegue rapidamente pelas principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/importacao" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Importar Dados</p>
                      <p className="text-xs text-muted-foreground">
                        Carregar disciplinas, docentes e formulários
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/cruzamentos" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div className="text-left">
                      <p className="font-medium">Revisar Cruzamentos</p>
                      <p className="text-xs text-muted-foreground">
                        {(stats?.cruzamentosPendentes || 0) +
                          (stats?.cruzamentosErro || 0)}{" "}
                        item(s) precisam de atenção
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/exportacao" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3 cursor-pointer"
                  disabled={progressoImportacao < 100}
                >
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium">Exportar JSON</p>
                      <p className="text-xs text-muted-foreground">
                        {progressoImportacao < 100
                          ? "Complete a importação primeiro"
                          : "Gerar arquivo consolidado"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Cruzamentos */}
        {totalCruzamentos > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Cruzamentos</CardTitle>
              <CardDescription>
                Distribuição do status de vinculação turma-docente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                {stats?.cruzamentosVinculados ? (
                  <div
                    className="bg-green-500 transition-all"
                    style={{
                      width: `${
                        (stats.cruzamentosVinculados / totalCruzamentos) * 100
                      }%`,
                    }}
                  />
                ) : null}
                {stats?.cruzamentosPendentes ? (
                  <div
                    className="bg-yellow-500 transition-all"
                    style={{
                      width: `${
                        (stats.cruzamentosPendentes / totalCruzamentos) * 100
                      }%`,
                    }}
                  />
                ) : null}
                {stats?.cruzamentosErro ? (
                  <div
                    className="bg-red-500 transition-all"
                    style={{
                      width: `${
                        (stats.cruzamentosErro / totalCruzamentos) * 100
                      }%`,
                    }}
                  />
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">
                    Vinculados ({stats?.cruzamentosVinculados || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">
                    Pendentes ({stats?.cruzamentosPendentes || 0})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">
                    Com Erro ({stats?.cruzamentosErro || 0})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    idle: {
      label: "Aguardando",
      className: "bg-muted text-muted-foreground",
    },
    loading: {
      label: "Carregando...",
      className: "bg-blue-100 text-blue-700",
    },
    success: {
      label: "Concluído",
      className: "bg-green-100 text-green-700",
    },
    error: {
      label: "Erro",
      className: "bg-red-100 text-red-700",
    },
  };

  const { label, className } = config[status] || config.idle;

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
