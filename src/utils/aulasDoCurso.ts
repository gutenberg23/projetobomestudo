/**
 * Seleção de aulas por disciplina num curso (cursos.aulas_por_disciplina):
 * { [disciplinaId]: aulaIds[] }. Disciplina sem chave no mapa = todas as aulas.
 */
export type AulasPorDisciplina = Record<string, string[]>;

/** Lê a coluna jsonb do banco, ignorando valores malformados. */
export const lerAulasPorDisciplina = (valor: unknown): AulasPorDisciplina => {
  const mapa: AulasPorDisciplina = {};
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return mapa;
  Object.entries(valor as Record<string, unknown>).forEach(([id, aulas]) => {
    if (Array.isArray(aulas)) mapa[id] = aulas.filter((a): a is string => typeof a === "string");
  });
  return mapa;
};

/**
 * Aulas da disciplina que entram no curso, sempre na ordem da disciplina.
 * Aulas escolhidas que saíram da disciplina são ignoradas.
 */
export const aulasDaDisciplinaNoCurso = (
  aulasDaDisciplina: string[] | null | undefined,
  selecao: AulasPorDisciplina | null | undefined,
  disciplinaId: string
): string[] => {
  const todas = (aulasDaDisciplina || []).filter(Boolean);
  const escolhidas = selecao?.[disciplinaId];
  if (!escolhidas) return todas;
  const set = new Set(escolhidas);
  return todas.filter((id) => set.has(id));
};
