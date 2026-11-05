import type { AulasPorDisciplina } from "@/utils/aulasDoCurso";

export interface Curso {
  id: string;
  titulo: string;
  /** Cargo */
  descricao: string;
  disciplinasIds: string[];
  aulasIds: string[];
  topicosIds: string[];
  questoesIds: string[];
  totalQuestoes: number;
  favoritos: number;
  informacoesCurso: string;
  criadoEm?: string;
  /** Aulas escolhidas em cada disciplina (sem chave = todas) */
  aulasPorDisciplina: AulasPorDisciplina;
  /** A coluna aulas_por_disciplina já existe no banco (migration aplicada) */
  temColunaSelecao: boolean;
}
