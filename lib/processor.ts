import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import type {
  Disciplina,
  DisciplinaRaw,
  Docente,
  FormularioRaw,
  CruzamentoTurma,
  ExportData,
} from "./types";

// ===== NORMALIZAÇÃO DE CHAVES =====

export function normalizeKey(key: string): string {
  try {
    const [disciplina, turmaStr] = key.split(",");
    if (!disciplina || !turmaStr) return key;

    // Normaliza: '1.0' -> '1', '2.0' -> '2'
    const turmaNormalizada = String(parseInt(parseFloat(turmaStr).toString()));
    return `${disciplina},${turmaNormalizada}`;
  } catch {
    return key;
  }
}

// ===== PROCESSAMENTO DE DISCIPLINAS =====

export function processDisciplinasJSON(
  jsonData: DisciplinaRaw[],
): Disciplina[] {
  return jsonData.map((d) => ({
    id: d.id,
    nome: d.nome,
    cursos: d.curso,
    docentes: [],
    semestre: d.semestre,
    horarios: d.horarios,
    ementa: d.ementa ?? "",
    nivel: d.nivel ?? "g",
    noturna: d.noturna ?? false,
  }));
}

// ===== PROCESSAMENTO DE DOCENTES (XLSX) =====

export interface DocentesExcelResult {
  docentes: Docente[];
  saldos: Record<string, number>;
}

export function processDocentesXLSX(buffer: ArrayBuffer): DocentesExcelResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  const docentes: Docente[] = [];
  const saldos: Record<string, number> = {};

  for (const row of data) {
    const nome = row["Docente"] as string | undefined;
    const carga = row["Carga"] as number | undefined;
    const novoSaldo = row["Novo Saldo"] as number | undefined;

    // Ignora linhas sem carga (como no script original)
    if (!nome || carga === undefined || carga === null) continue;

    docentes.push({
      nome,
      ativo: true,
      comentario: "",
      agrupar: "",
    });

    if (novoSaldo !== undefined) {
      saldos[nome] = novoSaldo;
    }
  }

  return { docentes, saldos };
}

// ===== PROCESSAMENTO DE FORMULÁRIOS =====

export interface FormulariosResult {
  formularios: Record<string, Record<string, number>>;
  cruzamentos: CruzamentoTurma[];
  docentesAvaliacao: Record<
    string,
    { comentario: string; preferencia: string }
  >;
}

export function processFormularios(
  files: { name: string; data: FormularioRaw }[],
  disciplinasMap: Map<string, Disciplina>,
): FormulariosResult {
  const formularios: Record<string, Record<string, number>> = {};
  const cruzamentos: CruzamentoTurma[] = [];
  const docentesAvaliacao: Record<
    string,
    { comentario: string; preferencia: string }
  > = {};

  for (const file of files) {
    const nomeDocente = file.name.replace(".json", "");
    const dados = file.data;

    // Pega o primeiro (e geralmente único) nome no objeto
    const primeiraChave = Object.keys(dados)[0];
    if (!primeiraChave) continue;

    const info = dados[primeiraChave];

    // Salva avaliação do docente
    docentesAvaliacao[nomeDocente] = {
      comentario: info.avaliacao?.comentario ?? "",
      preferencia: info.avaliacao?.preferencia ?? "",
    };

    // Processa formulários
    const formulariosDocente: Record<string, number> = {};
    const turmasInfo = info.formularios || {};

    for (const [chaveOriginal, prioridade] of Object.entries(turmasInfo)) {
      const chaveNormalizada = normalizeKey(chaveOriginal);

      let disciplinaId: string | null = null;
      let status: CruzamentoTurma["status"] = "pendente";

      // Tenta encontrar a disciplina
      if (disciplinasMap.has(chaveNormalizada)) {
        disciplinaId = chaveNormalizada;
        status = "vinculado";
        formulariosDocente[chaveNormalizada] = prioridade;
      } else if (disciplinasMap.has(chaveNormalizada + "1")) {
        // Fallback do script original
        disciplinaId = chaveNormalizada + "1";
        status = "vinculado";
        formulariosDocente[chaveNormalizada + "1"] = prioridade;
      } else {
        status = "erro";
      }

      cruzamentos.push({
        id: uuidv4(),
        docente: nomeDocente,
        chaveOriginal,
        chaveNormalizada,
        disciplinaId,
        prioridade,
        status,
        erro:
          status === "erro"
            ? `Chave "${chaveOriginal}" não encontrada nas disciplinas`
            : undefined,
      });
    }

    formularios[nomeDocente] = formulariosDocente;
  }

  return { formularios, cruzamentos, docentesAvaliacao };
}

// ===== GERAÇÃO DO EXPORT =====

export function generateExportData(
  disciplinas: Disciplina[],
  docentes: Docente[],
  saldos: Record<string, number>,
  formularios: Record<string, Record<string, number>>,
): ExportData {
  const disciplinasFormatadas: Record<string, any> = {};

  for (const d of disciplinas) {
    const docentesVinculados: string[] = [];

    // Busca os docentes vinculados a essa disciplina através dos formulários
    for (const [docente, turmas] of Object.entries(formularios)) {
      if (Object.keys(turmas).includes(d.id)) {
        docentesVinculados.push(docente);
      }
    }

    // Extrai o código e a turma a partir do id (ex: "5500004,1")
    const [codigo, turmaStr] = d.id.split(",");

    // Converte a turma para número (se existir) ou mantém um fallback
    const turma = turmaStr ? parseInt(turmaStr, 10) : undefined;

    // Utiliza o próprio d.id como chave do dicionário
    disciplinasFormatadas[d.id] = {
      ...d,
      codigo: codigo,
      turma: turma,
      docentes: docentesVinculados,
    };
  }

  // Garante que todos os docentes têm um formulário (mesmo vazio)
  const formulariosCompletos: Record<string, Record<string, number>> = {};
  for (const docente of docentes) {
    formulariosCompletos[docente.nome] = formularios[docente.nome] || {};
  }

  // Formata saldos com no máximo 2 casas decimais
  const saldosFormatados: Record<string, number> = {};
  for (const [nome, saldo] of Object.entries(saldos)) {
    saldosFormatados[nome] = Math.round(saldo * 100) / 100;
  }

  return {
    versao: "3.0",
    formularios: formulariosCompletos,
    disciplinas: disciplinasFormatadas,
    docentes: docentes, // Array de objetos, como especificado
    saldos: saldosFormatados,
  };
}
