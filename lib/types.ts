// ===== TIPOS DO DOMÍNIO =====

export interface Horario {
  dia: string;
  inicio: string;
  fim: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  cursos?: string;
  docentes: string[];
  semestre?: string;
  horarios?: Horario[];
  nivel: string;
  ementa: string;
  noturna: boolean;
}

export interface Docente {
  nome: string;
  ativo: boolean;
  comentario: string;
  agrupar: string;
}

export interface FormularioDocente {
  avaliacao?: Record<string, unknown>;
  comentario?: string;
  preferencia?: string;
  formularios: Record<string, number>; // chave normalizada -> peso
}

export interface SaldoDocente {
  nome: string;
  saldo: number;
}

// ===== TIPOS DE IMPORTAÇÃO =====

export interface DisciplinaRaw {
  id: string;
  nome: string;
  curso: string;
  semestre?: string;
  horarios?: Horario[];
  nivel?: string;
  ementa?: string;
  noturna?: boolean;
}

export interface FormularioRaw {
  [docenteNome: string]: {
    avaliacao?: { nota: number; comentario: string; preferencia: string };
    // comentario?: string;
    preferencia?: string;
    formularios?: Record<string, number>;
  };
}

// ===== TIPOS DE CRUZAMENTO =====

export interface CruzamentoTurma {
  id: string;
  docente: string;
  chaveOriginal: string;
  chaveNormalizada: string | null;
  disciplinaId: string | null;
  prioridade: number;
  status: "vinculado" | "pendente" | "erro";
  erro?: string;
}

// ===== TIPOS DE EXPORTAÇÃO =====

export interface ExportData {
  versao: string;
  formularios: Record<string, Record<string, number>>;
  disciplinas: Record<string, Disciplina>;
  docentes: Docente[];
  saldos: Record<string, number>;
}

// ===== TIPOS DE ESTADO DA APLICAÇÃO =====

export interface ImportStatus {
  disciplinas: "idle" | "loading" | "success" | "error";
  docentes: "idle" | "loading" | "success" | "error";
  formularios: "idle" | "loading" | "success" | "error";
}

export interface AppStats {
  totalDisciplinas: number;
  totalDocentes: number;
  totalFormularios: number;
  cruzamentosVinculados: number;
  cruzamentosPendentes: number;
  cruzamentosErro: number;
}
