import { supabase } from "@/integrations/supabase/client";

export interface ComposicaoCurso {
  disciplinas_ids: string[];
  aulas_ids: string[];
  topicos_ids: string[];
  questoes_ids: string[];
}

const unicos = (lista: (string | null | undefined)[]) =>
  Array.from(new Set(lista.filter((x): x is string => !!x && x.trim() !== "")));

export type Linha = { id: string; aulas_ids?: string[] | null; topicos_ids?: string[] | null; questoes_ids?: string[] | null };

/** Busca em lotes de 100 ids para não estourar o tamanho da URL. */
export const buscarEmLotes = async (tabela: "disciplinas" | "aulas" | "topicos" | "cursos", colunas: string, ids: string[]): Promise<Linha[]> => {
  const resultado: Linha[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase.from(tabela).select(colunas).in("id", ids.slice(i, i + 100));
    if (error) throw error;
    resultado.push(...((data || []) as unknown as Linha[]));
  }
  return resultado;
};

/**
 * Calcula aulas, tópicos e questões de um curso a partir das disciplinas.
 * Consulta em lote (antes era uma consulta por aula e por tópico).
 */
export const calcularComposicaoCurso = async (disciplinasIds: string[]): Promise<ComposicaoCurso> => {
  const disciplinas_ids = unicos(disciplinasIds);
  if (disciplinas_ids.length === 0) {
    return { disciplinas_ids, aulas_ids: [], topicos_ids: [], questoes_ids: [] };
  }

  const disciplinas = await buscarEmLotes("disciplinas", "id, aulas_ids", disciplinas_ids);

  // Mantém a ordem das disciplinas escolhidas
  const aulasPorDisciplina = new Map(disciplinas.map((d) => [d.id, (d.aulas_ids || []) as string[]]));
  const aulas_ids = unicos(disciplinas_ids.flatMap((id) => aulasPorDisciplina.get(id) || []));

  let topicos_ids: string[] = [];
  let questoes: string[] = [];
  if (aulas_ids.length > 0) {
    const encontradas = await buscarEmLotes("aulas", "id, topicos_ids, questoes_ids", aulas_ids);
    // Reordena na ordem das aulas para manter a sequência dos tópicos
    const porId = new Map(encontradas.map((a) => [a.id, a]));
    const aulas = aulas_ids.map((id) => porId.get(id)).filter((a): a is Linha => !!a);
    topicos_ids = unicos(aulas.flatMap((a) => (a.topicos_ids || []) as string[]));
    questoes = aulas.flatMap((a) => (a.questoes_ids || []) as string[]);
  }

  if (topicos_ids.length > 0) {
    const topicos = await buscarEmLotes("topicos", "id, questoes_ids", topicos_ids);
    questoes = questoes.concat(topicos.flatMap((t) => (t.questoes_ids || []) as string[]));
  }

  return { disciplinas_ids, aulas_ids, topicos_ids, questoes_ids: unicos(questoes) };
};
