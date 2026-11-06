import { aulasDaDisciplinaNoCurso, lerAulasPorDisciplina, type AulasPorDisciplina } from "./aulasDoCurso";

/**
 * Seleção de teorias por disciplina num curso (cursos.teorias_por_disciplina):
 * { [disciplinaId]: teoriaIds[] }. Disciplina sem chave no mapa = todas as teorias.
 * Mesmo formato e mesmas regras da antiga seleção de aulas.
 */
export type TeoriasPorDisciplina = AulasPorDisciplina;

export const lerTeoriasPorDisciplina = lerAulasPorDisciplina;

/** Teorias da disciplina que entram no curso, sempre na ordem da disciplina. */
export const teoriasDaDisciplinaNoCurso = (
  teoriasDaDisciplina: string[] | null | undefined,
  selecao: TeoriasPorDisciplina | null | undefined,
  disciplinaId: string
): string[] => aulasDaDisciplinaNoCurso(teoriasDaDisciplina, selecao, disciplinaId);
