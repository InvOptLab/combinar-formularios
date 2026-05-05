"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Disciplina,
  Docente,
  CruzamentoTurma,
  ImportStatus,
  AppStats,
} from "./types";

interface ETLStore {
  // Dados
  disciplinas: Disciplina[];
  docentes: Docente[];
  saldos: Record<string, number>;
  formularios: Record<string, Record<string, number>>;
  cruzamentos: CruzamentoTurma[];

  // Status de importação
  importStatus: ImportStatus;

  // Ações de Disciplinas
  setDisciplinas: (disciplinas: Disciplina[]) => void;
  updateDisciplina: (id: string, data: Partial<Disciplina>) => void;

  // Ações de Docentes
  setDocentes: (docentes: Docente[]) => void;
  updateDocente: (nome: string, data: Partial<Docente>) => void;
  setSaldos: (saldos: Record<string, number>) => void;
  updateSaldo: (nome: string, saldo: number) => void;

  // Ações de Formulários
  setFormularios: (formularios: Record<string, Record<string, number>>) => void;
  updateFormulario: (
    docente: string,
    turma: string,
    peso: number | null,
  ) => void;

  // Ações de Cruzamentos
  setCruzamentos: (cruzamentos: CruzamentoTurma[]) => void;
  updateCruzamento: (id: string, disciplinaId: string) => void;
  deleteCruzamento: (id: string) => void;

  // Status
  setImportStatus: (
    type: keyof ImportStatus,
    status: ImportStatus[keyof ImportStatus],
  ) => void;

  // Estatísticas
  getStats: () => AppStats;

  // Reset
  resetAll: () => void;
}

const initialState = {
  disciplinas: [],
  docentes: [],
  saldos: {},
  formularios: {},
  cruzamentos: [],
  importStatus: {
    disciplinas: "idle" as const,
    docentes: "idle" as const,
    formularios: "idle" as const,
  },
};

export const useETLStore = create<ETLStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Disciplinas
      setDisciplinas: (disciplinas) => {
        set({ disciplinas });
        set((state) => ({
          importStatus: { ...state.importStatus, disciplinas: "success" },
        }));
      },

      updateDisciplina: (id, data) =>
        set((state) => ({
          disciplinas: state.disciplinas.map((d) =>
            d.id === id ? { ...d, ...data } : d,
          ),
        })),

      // Docentes
      setDocentes: (docentes) => {
        set({ docentes });
        set((state) => ({
          importStatus: { ...state.importStatus, docentes: "success" },
        }));
      },

      updateDocente: (nome, data) =>
        set((state) => ({
          docentes: state.docentes.map((d) =>
            d.nome === nome ? { ...d, ...data } : d,
          ),
        })),

      setSaldos: (saldos) => set({ saldos }),

      updateSaldo: (nome, saldo) =>
        set((state) => ({
          saldos: { ...state.saldos, [nome]: saldo },
        })),

      // Formulários
      setFormularios: (formularios) => {
        set({ formularios });
        set((state) => ({
          importStatus: { ...state.importStatus, formularios: "success" },
        }));
      },

      updateFormulario: (docente, turma, peso) =>
        set((state) => {
          const docenteFormularios = { ...state.formularios[docente] };
          if (peso === null) {
            delete docenteFormularios[turma];
          } else {
            docenteFormularios[turma] = peso;
          }
          return {
            formularios: {
              ...state.formularios,
              [docente]: docenteFormularios,
            },
          };
        }),

      // Cruzamentos
      setCruzamentos: (cruzamentos) => set({ cruzamentos }),

      updateCruzamento: (id, disciplinaId) =>
        set((state) => {
          const disciplina = state.disciplinas.find(
            (d) => d.id === disciplinaId,
          );
          return {
            cruzamentos: state.cruzamentos.map((c) =>
              c.id === id
                ? {
                    ...c,
                    disciplinaId,
                    chaveNormalizada: disciplinaId,
                    status: disciplina
                      ? ("vinculado" as const)
                      : ("erro" as const),
                  }
                : c,
            ),
          };
        }),

      deleteCruzamento: (id) =>
        set((state) => {
          const cruzamento = state.cruzamentos.find((c) => c.id === id);
          if (!cruzamento) return state;

          // Remove a entrada correspondente no formulário do docente
          const docenteFormularios = {
            ...(state.formularios[cruzamento.docente] ?? {}),
          };
          const chave =
            cruzamento.disciplinaId ??
            cruzamento.chaveNormalizada ??
            cruzamento.chaveOriginal;
          delete docenteFormularios[chave];

          // Também remove pela chave original normalizada, caso seja diferente
          if (
            cruzamento.chaveNormalizada &&
            cruzamento.chaveNormalizada !== chave
          ) {
            delete docenteFormularios[cruzamento.chaveNormalizada];
          }

          return {
            cruzamentos: state.cruzamentos.filter((c) => c.id !== id),
            formularios: {
              ...state.formularios,
              [cruzamento.docente]: docenteFormularios,
            },
          };
        }),

      // Status
      setImportStatus: (type, status) =>
        set((state) => ({
          importStatus: { ...state.importStatus, [type]: status },
        })),

      // Estatísticas
      getStats: () => {
        const state = get();
        const cruzamentosVinculados = state.cruzamentos.filter(
          (c) => c.status === "vinculado",
        ).length;
        const cruzamentosPendentes = state.cruzamentos.filter(
          (c) => c.status === "pendente",
        ).length;
        const cruzamentosErro = state.cruzamentos.filter(
          (c) => c.status === "erro",
        ).length;

        return {
          totalDisciplinas: state.disciplinas.length,
          totalDocentes: state.docentes.length,
          totalFormularios: Object.keys(state.formularios).length,
          cruzamentosVinculados,
          cruzamentosPendentes,
          cruzamentosErro,
        };
      },

      // Reset
      resetAll: () => set(initialState),
    }),
    {
      name: "etl-storage",
    },
  ),
);
