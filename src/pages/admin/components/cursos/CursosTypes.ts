import type { TeoriasPorDisciplina } from "@/utils/teoriasDoCurso";

export interface Curso {
  id: string;
  titulo: string;
  /** Cargo */
  descricao: string;
  disciplinasIds: string[];
  favoritos: number;
  informacoesCurso: string;
  criadoEm?: string;
  /** Teorias escolhidas em cada disciplina (sem chave = todas) */
  teoriasPorDisciplina: TeoriasPorDisciplina;
  /** Teorias do curso (somando as disciplinas, já com a seleção) */
  totalTeorias: number;
  /** A coluna teorias_por_disciplina já existe no banco (migration aplicada) */
  temColunaSelecao: boolean;
}
