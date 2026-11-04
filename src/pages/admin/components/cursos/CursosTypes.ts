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
}
