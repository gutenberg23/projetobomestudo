/**
 * Relevância de cada disciplina num curso (cursos.relevancia_por_disciplina):
 * { [disciplinaId]: 1..10 }. Cada concurso dá um peso diferente às disciplinas.
 * Disciplina sem chave = sem nota.
 */
export type RelevanciaPorDisciplina = Record<string, number>;

export const notaValida = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
};

export function lerRelevancias(valor: unknown): RelevanciaPorDisciplina {
  const r: RelevanciaPorDisciplina = {};
  if (valor && typeof valor === "object" && !Array.isArray(valor)) {
    Object.entries(valor as Record<string, unknown>).forEach(([id, v]) => {
      const n = notaValida(v);
      if (n !== null) r[id] = n;
    });
  }
  return r;
}
