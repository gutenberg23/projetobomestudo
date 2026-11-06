import type { TeoriasPorDisciplina } from "@/utils/teoriasDoCurso";
import type { RelevanciaPorDisciplina } from "@/utils/relevanciaDoCurso";

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
  /** Relevância (1 a 10) de cada disciplina neste curso */
  relevanciaPorDisciplina: RelevanciaPorDisciplina;
  /** A coluna relevancia_por_disciplina já existe no banco (migration aplicada) */
  temColunaRelevancia: boolean;
}
