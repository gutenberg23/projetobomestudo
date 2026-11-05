import { emptyFilterSet, type QuestionFilterSet } from "@/utils/editalQuestionFilters";

/**
 * Estado da página /questions guardado na URL.
 *
 * Os nomes dos parâmetros são os mesmos de antes (disciplines, topics,
 * subtopics, institutions...), porque os links do edital verticalizado e do
 * admin já apontam para eles. As listas são gravadas como JSON, o que evita
 * quebrar um assunto que tenha vírgula no nome. Links antigos separados por
 * vírgula continuam sendo lidos.
 */

export type ChaveFiltro =
  | "disciplines"
  | "topics"
  | "subtopics"
  | "institutions"
  | "organizations"
  | "roles"
  | "years"
  | "educationLevels"
  | "difficulty";

export type Filtros = Omit<QuestionFilterSet, "q">;

export type Ordem = "recentes" | "antigas" | "ano";
export type Situacao = "todas" | "nao_resolvidas" | "erradas" | "acertadas";

export interface EstadoBusca {
  q: string;
  filtros: Filtros;
  pagina: number;
  porPagina: number;
  ordem: Ordem;
  situacao: Situacao;
}

export const CHAVES: ChaveFiltro[] = [
  "disciplines",
  "topics",
  "subtopics",
  "institutions",
  "organizations",
  "roles",
  "years",
  "educationLevels",
  "difficulty",
];

/** Filtros que aparecem na tela, na ordem em que aparecem. (Cargo segue oculto.) */
export const FILTROS_VISIVEIS: ChaveFiltro[] = [
  "disciplines",
  "topics",
  "subtopics",
  "institutions",
  "organizations",
  "years",
  "educationLevels",
  "difficulty",
];

export const ROTULOS: Record<ChaveFiltro, string> = {
  disciplines: "Disciplina",
  topics: "Assunto",
  subtopics: "Tópico",
  institutions: "Banca",
  organizations: "Instituição",
  roles: "Cargo",
  years: "Ano",
  educationLevels: "Escolaridade",
  difficulty: "Dificuldade",
};

export const POR_PAGINA = [5, 10, 20, 50, 100];

export const ROTULOS_ORDEM: Record<Ordem, string> = {
  recentes: "Mais recentes",
  antigas: "Mais antigas",
  ano: "Ano da prova",
};

export const ROTULOS_SITUACAO: Record<Situacao, string> = {
  todas: "Todas",
  nao_resolvidas: "Não resolvidas",
  erradas: "Que errei",
  acertadas: "Que acertei",
};

export const filtrosVazios = (): Filtros => {
  const { q: _q, ...resto } = emptyFilterSet();
  return resto;
};

const limpar = (valores: unknown[]) =>
  valores.map((v) => (v === null || v === undefined ? "" : String(v).trim())).filter(Boolean);

const lerLista = (params: URLSearchParams, chave: string): string[] => {
  const valor = params.get(chave);
  if (!valor) return [];
  try {
    const lido = JSON.parse(valor);
    return limpar(Array.isArray(lido) ? lido : [lido]);
  } catch {
    return limpar(valor.split(","));
  }
};

export function lerEstado(params: URLSearchParams): EstadoBusca {
  const filtros = filtrosVazios();
  CHAVES.forEach((c) => (filtros[c] = lerLista(params, c)));
  const porPagina = Number(params.get("perPage"));
  const pagina = Number(params.get("page"));
  const ordem = params.get("sort") as Ordem;
  const situacao = params.get("status") as Situacao;
  return {
    q: (params.get("q") || "").trim(),
    filtros,
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    porPagina: POR_PAGINA.includes(porPagina) ? porPagina : 10,
    ordem: ordem && ordem in ROTULOS_ORDEM ? ordem : "recentes",
    situacao: situacao && situacao in ROTULOS_SITUACAO ? situacao : "todas",
  };
}

export function gravarEstado(e: EstadoBusca): URLSearchParams {
  const p = new URLSearchParams();
  if (e.q) p.set("q", e.q);
  CHAVES.forEach((c) => {
    if (e.filtros[c].length) p.set(c, JSON.stringify(e.filtros[c]));
  });
  if (e.ordem !== "recentes") p.set("sort", e.ordem);
  if (e.situacao !== "todas") p.set("status", e.situacao);
  if (e.porPagina !== 10) p.set("perPage", String(e.porPagina));
  if (e.pagina > 1) p.set("page", String(e.pagina));
  return p;
}

export const contarFiltros = (f: Filtros) => CHAVES.reduce((s, c) => s + f[c].length, 0);

/**
 * Liga ou desliga um valor. Ao tirar a última disciplina, assuntos e tópicos
 * deixam de fazer sentido e são limpos (mesma regra de antes).
 */
export function alternarValor(f: Filtros, chave: ChaveFiltro, valor: string): Filtros {
  const atual = f[chave];
  const novo = { ...f, [chave]: atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor] };
  if (chave === "disciplines" && novo.disciplines.length === 0) {
    novo.topics = [];
    novo.subtopics = [];
  }
  return novo;
}

export const formatarNumero = (n: number) => n.toLocaleString("pt-BR");
