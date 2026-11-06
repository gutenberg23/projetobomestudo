import { filtrosVazios, gravarEstado, type Filtros } from "@/components/questions/busca/filtros";

/**
 * Filtros das questões de uma teoria, como ficam gravados em
 * `teorias.questoes_filtros` (jsonb).
 *
 * As quatro primeiras chaves (disciplinas, assuntos, bancas, topicos) são as
 * que já existiam e continuam com o mesmo nome, então as teorias salvas antes
 * seguem funcionando. As demais são opcionais e só aparecem quando usadas.
 */
export interface FiltrosQuestoesTeoria {
  disciplinas?: string[];
  assuntos?: string[]; // questoes.assuntos
  topicos?: string[]; // questoes.topicos
  bancas?: string[]; // questoes.institution
  instituicoes?: string[]; // questoes.organization
  anos?: string[]; // questoes.year
  escolaridades?: string[]; // questoes.level
  dificuldades?: string[]; // questoes.difficulty
  /** Palavra-chave procurada no enunciado. */
  palavra?: string;
}

const CHAVES_LISTA = [
  "disciplinas",
  "assuntos",
  "topicos",
  "bancas",
  "instituicoes",
  "anos",
  "escolaridades",
  "dificuldades",
] as const;

type ChaveLista = (typeof CHAVES_LISTA)[number];

/** Chave gravada na teoria ↔ chave usada em /questions. */
const PARA_BUSCA: Record<ChaveLista, keyof Filtros> = {
  disciplinas: "disciplines",
  assuntos: "topics",
  topicos: "subtopics",
  bancas: "institutions",
  instituicoes: "organizations",
  anos: "years",
  escolaridades: "educationLevels",
  dificuldades: "difficulty",
};

const lista = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (x === null || x === undefined ? "" : String(x).trim())).filter(Boolean) : [];

/** Lê o que está gravado (aceita objeto vazio, nulo ou chaves faltando). */
export function lerFiltrosTeoria(gravado: unknown): { filtros: Filtros; palavra: string } {
  const g = (gravado && typeof gravado === "object" ? gravado : {}) as Record<string, unknown>;
  const filtros = filtrosVazios();
  CHAVES_LISTA.forEach((c) => (filtros[PARA_BUSCA[c]] = lista(g[c])));
  return { filtros, palavra: typeof g.palavra === "string" ? g.palavra.trim() : "" };
}

/** Monta o objeto a gravar, só com as chaves usadas. */
export function gravarFiltrosTeoria(filtros: Filtros, palavra: string): FiltrosQuestoesTeoria {
  const saida: FiltrosQuestoesTeoria = {};
  CHAVES_LISTA.forEach((c) => {
    const v = filtros[PARA_BUSCA[c]];
    if (v.length) saida[c] = [...v];
  });
  if (palavra.trim()) saida.palavra = palavra.trim();
  return saida;
}

/** A teoria tem algum filtro? Sem filtro, a aba Questões não aparece. */
export function temFiltrosQuestoes(gravado: unknown): boolean {
  if (!gravado || typeof gravado !== "object") return false;
  const g = gravado as Record<string, unknown>;
  return CHAVES_LISTA.some((c) => lista(g[c]).length > 0) || (typeof g.palavra === "string" && !!g.palavra.trim());
}

/** Link para /questions com os mesmos filtros. */
export function linkQuestoesTeoria(gravado: unknown): string {
  const { filtros, palavra } = lerFiltrosTeoria(gravado);
  const p = gravarEstado({ q: palavra, filtros, pagina: 1, porPagina: 10, ordem: "recentes", situacao: "todas" });
  const s = p.toString();
  return s ? `/questions?${s}` : "/questions";
}

/**
 * Aplica os filtros numa consulta de `questoes` (E entre filtros, OU dentro de
 * cada um), do mesmo jeito que /questions faz.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aplicarFiltrosTeoria<Q extends { in: any; overlaps: any; ilike: any }>(consulta: Q, gravado: unknown): Q {
  const { filtros: f, palavra } = lerFiltrosTeoria(gravado);
  let c = consulta;
  if (palavra) c = c.ilike("content", `%${palavra}%`);
  if (f.disciplines.length) c = c.in("discipline", f.disciplines);
  if (f.topics.length) c = c.overlaps("assuntos", f.topics);
  if (f.subtopics.length) c = c.overlaps("topicos", f.subtopics);
  if (f.institutions.length) c = c.in("institution", f.institutions);
  if (f.organizations.length) c = c.in("organization", f.organizations);
  if (f.years.length) c = c.in("year", f.years);
  if (f.educationLevels.length) c = c.in("level", f.educationLevels);
  if (f.difficulty.length) c = c.in("difficulty", f.difficulty);
  return c;
}
