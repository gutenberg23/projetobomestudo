import { supabase } from "@/integrations/supabase/client";
import { carregarDisciplinasCurso } from "../disciplinas/useDisciplinasCurso";
import { normalizar } from "../ui";

/**
 * Dados da aba Estatísticas: quantas questões de uma disciplina caem em cada
 * assunto e tópico, com filtros de banca, instituição e ano.
 *
 * O caminho principal são as funções do banco estatisticas_assuntos e
 * opcoes_estatisticas_assuntos (migration 20251113000000), que já devolvem as
 * contagens. Se a migration ainda não foi rodada, a página baixa as questões da
 * disciplina em páginas de 1.000 (limite do Supabase) e conta aqui mesmo.
 */

export interface Filtros {
  bancas: string[];
  instituicoes: string[];
  anos: string[];
}

export const filtrosVazios = (): Filtros => ({ bancas: [], instituicoes: [], anos: [] });

export interface Opcao {
  valor: string;
  total: number;
}

export interface OpcoesFiltros {
  bancas: Opcao[];
  instituicoes: Opcao[];
  anos: Opcao[];
}

/** Mesmo formato devolvido pela função estatisticas_assuntos. */
export interface LinhaEstatistica {
  tipo: "total" | "sem_assunto" | "assunto" | "topico" | "par";
  assunto: string | null;
  topico: string | null;
  total: number;
}

export interface TopicoContado {
  nome: string;
  total: number;
}

export interface AssuntoContado {
  nome: string;
  total: number;
  /** Tópicos que aparecem mais neste assunto, do mais cobrado ao menos */
  topicos: TopicoContado[];
}

export interface Estatisticas {
  /** Questões que passam nos filtros */
  total: number;
  /** Dessas, quantas não têm assunto cadastrado */
  semAssunto: number;
  /** Assuntos do mais cobrado ao menos */
  assuntos: AssuntoContado[];
}

const PAGINA = 1000;
const LOTE_IDS = 150;
/** Teto do modo sem migration (100 mil questões) */
const MAX_PAGINAS = 100;

// As funções novas ainda não estão nos tipos gerados do Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const limpar = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

// ---------------------------------------------------------------------------
// Qual disciplina das questões corresponde à disciplina do site
// ---------------------------------------------------------------------------

/**
 * A disciplina do site (ex.: "Português para a PM") e a disciplina das
 * questões (ex.: "Língua Portuguesa") são cadastros diferentes. Descobrimos o
 * nome usado nas questões olhando, nesta ordem de peso:
 *  1. a disciplina das questões ligadas aos tópicos das aulas;
 *  2. o campo "Disciplina" dos tópicos;
 *  3. o título da disciplina, se existir igual nas questões.
 * Devolve os nomes encontrados, do mais provável ao menos.
 */
export async function descobrirDisciplinasDasQuestoes(courseId: string): Promise<string[]> {
  const dados = await carregarDisciplinasCurso(courseId);

  // Definida no admin (Disciplinas ou Aulas): vale sem tentar adivinhar
  const definida = limpar(dados.linhasDisciplinas[0]?.disciplina_questoes);
  if (definida) return [definida];
  const pesos = new Map<string, number>();
  const somar = (nome: string, peso: number) => {
    const n = limpar(nome);
    if (n) pesos.set(n, (pesos.get(n) || 0) + peso);
  };

  const topicos = dados.disciplinas.flatMap((d) => d.aulas.flatMap((a) => a.topicos));

  // 1. Questões ligadas aos tópicos (até 300, o suficiente para descobrir o nome)
  const ids = Array.from(new Set(topicos.flatMap((t) => t.questoesIds))).slice(0, 300);
  for (let i = 0; i < ids.length; i += LOTE_IDS) {
    const { data } = await db.from("questoes").select("discipline").in("id", ids.slice(i, i + LOTE_IDS));
    ((data || []) as Array<{ discipline: string | null }>).forEach((q) => somar(q.discipline || "", 3));
  }

  // 2. Campo "Disciplina" dos tópicos
  topicos.forEach((t) => t.disciplinaQuestoes && somar(t.disciplinaQuestoes, 2));

  // Nomes oficiais cadastrados para as questões, para corrigir caixa e acentos
  const { data: oficiais } = await db.from("disciplinas_questoes").select("nome");
  const porChave = new Map<string, string>();
  ((oficiais || []) as Array<{ nome: string | null }>).forEach((d) => {
    const nome = limpar(d.nome);
    if (nome) porChave.set(normalizar(nome), nome);
  });

  // 3. Título da disciplina do site
  dados.linhasDisciplinas.forEach((d) => {
    const titulo = limpar(d.titulo);
    if (titulo && porChave.has(normalizar(titulo))) somar(titulo, 1);
  });

  // Junta variações do mesmo nome ("portugues" e "Português")
  const finais = new Map<string, number>();
  pesos.forEach((peso, nome) => {
    const oficial = porChave.get(normalizar(nome));
    const chave = oficial || nome;
    finais.set(chave, (finais.get(chave) || 0) + peso);
  });

  // Sem lista oficial disponível, usa o título como última tentativa
  if (finais.size === 0) {
    const titulo = limpar(dados.linhasDisciplinas[0]?.titulo);
    if (titulo) finais.set(titulo, 1);
  }

  return Array.from(finais.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .map(([nome]) => nome);
}

// ---------------------------------------------------------------------------
// Fonte dos números: funções do banco ou contagem no navegador
// ---------------------------------------------------------------------------

const faltaFuncao = (erro: { code?: string; message?: string } | null) =>
  !!erro &&
  (erro.code === "PGRST202" ||
    erro.code === "42883" ||
    /could not find the function|does not exist/i.test(erro.message || ""));

/** Chama uma função do banco que devolve muitas linhas, página por página. */
async function rpcPaginado<T>(nome: string, args: Record<string, unknown>, ordem: string[]): Promise<T[]> {
  const linhas: T[] = [];
  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    // Ordem fixa para as páginas não repetirem nem pularem linhas
    let consulta = db.rpc(nome, args);
    ordem.forEach((coluna) => (consulta = consulta.order(coluna, { ascending: true, nullsFirst: true })));
    const { data, error } = await consulta.range(pagina * PAGINA, pagina * PAGINA + PAGINA - 1);
    if (error) throw error;
    const parte = (data || []) as T[];
    linhas.push(...parte);
    if (parte.length < PAGINA) break;
  }
  return linhas;
}

interface QuestaoResumo {
  assuntos: string[] | null;
  topicos: string[] | null;
  institution: string | null;
  organization: string | null;
  year: string | number | null;
}

/** Baixa as questões da disciplina (só as colunas da contagem) em páginas de 1.000. */
async function baixarQuestoes(disciplina: string): Promise<QuestaoResumo[]> {
  const todas: QuestaoResumo[] = [];
  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    const { data, error } = await db
      .from("questoes")
      .select("assuntos, topicos, institution, organization, year")
      .eq("discipline", disciplina)
      .order("id", { ascending: true })
      .range(pagina * PAGINA, pagina * PAGINA + PAGINA - 1);
    if (error) throw error;
    const parte = (data || []) as QuestaoResumo[];
    todas.push(...parte);
    if (parte.length < PAGINA) break;
  }
  return todas;
}

const listaLimpa = (v: unknown): string[] =>
  Array.from(new Set((Array.isArray(v) ? v : []).map(limpar).filter(Boolean)));

const ordenarOpcoes = (mapa: Map<string, number>, numerico = false): Opcao[] =>
  Array.from(mapa.entries())
    .map(([valor, total]) => ({ valor, total }))
    .sort((a, b) =>
      numerico ? b.valor.localeCompare(a.valor, "pt-BR", { numeric: true }) : a.valor.localeCompare(b.valor, "pt-BR")
    );

/** Conta as questões no navegador, no mesmo formato da função do banco. */
export function contarQuestoes(questoes: QuestaoResumo[], filtros: Filtros): LinhaEstatistica[] {
  const bancas = new Set(filtros.bancas);
  const instituicoes = new Set(filtros.instituicoes);
  const anos = new Set(filtros.anos);
  let total = 0;
  let semAssunto = 0;
  const porAssunto = new Map<string, number>();
  const porTopico = new Map<string, number>();
  const porPar = new Map<string, number>();

  questoes.forEach((q) => {
    if (bancas.size && !bancas.has(limpar(q.institution))) return;
    if (instituicoes.size && !instituicoes.has(limpar(q.organization))) return;
    if (anos.size && !anos.has(limpar(q.year))) return;
    total++;
    const assuntos = listaLimpa(q.assuntos);
    const topicos = listaLimpa(q.topicos);
    if (assuntos.length === 0) semAssunto++;
    assuntos.forEach((a) => porAssunto.set(a, (porAssunto.get(a) || 0) + 1));
    topicos.forEach((t) => porTopico.set(t, (porTopico.get(t) || 0) + 1));
    assuntos.forEach((a) =>
      topicos.forEach((t) => {
        const chave = JSON.stringify([a, t]);
        porPar.set(chave, (porPar.get(chave) || 0) + 1);
      })
    );
  });

  const linhas: LinhaEstatistica[] = [
    { tipo: "total", assunto: null, topico: null, total },
    { tipo: "sem_assunto", assunto: null, topico: null, total: semAssunto },
  ];
  porAssunto.forEach((n, assunto) => linhas.push({ tipo: "assunto", assunto, topico: null, total: n }));
  porTopico.forEach((n, topico) => linhas.push({ tipo: "topico", assunto: null, topico, total: n }));
  porPar.forEach((n, chave) => {
    const [assunto, topico] = JSON.parse(chave) as [string, string];
    linhas.push({ tipo: "par", assunto, topico, total: n });
  });
  return linhas;
}

/** Opções dos filtros a partir das questões baixadas (modo sem migration). */
function opcoesDasQuestoes(questoes: QuestaoResumo[]): OpcoesFiltros {
  const bancas = new Map<string, number>();
  const instituicoes = new Map<string, number>();
  const anos = new Map<string, number>();
  const somar = (mapa: Map<string, number>, v: unknown) => {
    const valor = limpar(v);
    if (valor) mapa.set(valor, (mapa.get(valor) || 0) + 1);
  };
  questoes.forEach((q) => {
    somar(bancas, q.institution);
    somar(instituicoes, q.organization);
    somar(anos, q.year);
  });
  return {
    bancas: ordenarOpcoes(bancas),
    instituicoes: ordenarOpcoes(instituicoes),
    anos: ordenarOpcoes(anos, true),
  };
}

/**
 * Fonte dos números de uma disciplina. Tenta as funções do banco; se ainda não
 * existirem, baixa as questões uma vez e conta tudo no navegador.
 */
export interface FonteEstatisticas {
  modo: "banco" | "navegador";
  opcoes: OpcoesFiltros;
  linhas: (filtros: Filtros) => Promise<LinhaEstatistica[]>;
}

export async function abrirFonte(disciplina: string): Promise<FonteEstatisticas> {
  const { data, error } = await db.rpc("opcoes_estatisticas_assuntos", { p_disciplina: disciplina }).range(0, PAGINA - 1);

  if (!error) {
    let brutas = (data || []) as Array<{ campo: string; valor: string; total: number }>;
    if (brutas.length >= PAGINA) {
      brutas = await rpcPaginado("opcoes_estatisticas_assuntos", { p_disciplina: disciplina }, ["campo", "valor"]);
    }
    const mapas = { banca: new Map<string, number>(), instituicao: new Map<string, number>(), ano: new Map<string, number>() };
    brutas.forEach((l) => {
      const mapa = mapas[l.campo as keyof typeof mapas];
      if (mapa && limpar(l.valor)) mapa.set(limpar(l.valor), Number(l.total) || 0);
    });
    return {
      modo: "banco",
      opcoes: {
        bancas: ordenarOpcoes(mapas.banca),
        instituicoes: ordenarOpcoes(mapas.instituicao),
        anos: ordenarOpcoes(mapas.ano, true),
      },
      linhas: async (filtros) => {
        const linhas = await rpcPaginado<LinhaEstatistica>("estatisticas_assuntos", {
          p_disciplina: disciplina,
          p_bancas: filtros.bancas.length ? filtros.bancas : null,
          p_instituicoes: filtros.instituicoes.length ? filtros.instituicoes : null,
          p_anos: filtros.anos.length ? filtros.anos : null,
        }, ["tipo", "assunto", "topico"]);
        return linhas.map((l) => ({ ...l, total: Number(l.total) || 0 }));
      },
    };
  }

  if (!faltaFuncao(error)) throw error;

  // Migration ainda não rodada: conta no navegador
  const questoes = await baixarQuestoes(disciplina);
  return {
    modo: "navegador",
    opcoes: opcoesDasQuestoes(questoes),
    linhas: async (filtros) => contarQuestoes(questoes, filtros),
  };
}

// ---------------------------------------------------------------------------
// Montagem da hierarquia Assunto -> Tópico
// ---------------------------------------------------------------------------

/**
 * Uma questão guarda assuntos e tópicos em listas separadas, sem dizer qual
 * tópico pertence a qual assunto. Cada tópico fica no assunto com que ele mais
 * aparece junto (desempate pelo nome, para ser sempre o mesmo).
 */
export function montarEstatisticas(linhas: LinhaEstatistica[]): Estatisticas {
  let total = 0;
  let semAssunto = 0;
  const assuntos = new Map<string, number>();
  const topicos = new Map<string, number>();
  const melhorPai = new Map<string, { assunto: string; total: number }>();

  linhas.forEach((l) => {
    const n = Number(l.total) || 0;
    if (l.tipo === "total") total = n;
    else if (l.tipo === "sem_assunto") semAssunto = n;
    else if (l.tipo === "assunto" && l.assunto) assuntos.set(l.assunto, n);
    else if (l.tipo === "topico" && l.topico) topicos.set(l.topico, n);
    else if (l.tipo === "par" && l.assunto && l.topico) {
      const atual = melhorPai.get(l.topico);
      if (!atual || n > atual.total || (n === atual.total && l.assunto.localeCompare(atual.assunto, "pt-BR") < 0)) {
        melhorPai.set(l.topico, { assunto: l.assunto, total: n });
      }
    }
  });

  const filhos = new Map<string, TopicoContado[]>();
  topicos.forEach((n, topico) => {
    const pai = melhorPai.get(topico)?.assunto;
    if (!pai || !assuntos.has(pai)) return;
    // Um tópico nunca passa do total do assunto em que está
    const lista = filhos.get(pai) || [];
    lista.push({ nome: topico, total: Math.min(n, assuntos.get(pai) || n) });
    filhos.set(pai, lista);
  });

  const porTotal = <T extends { nome: string; total: number }>(a: T, b: T) =>
    b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR");

  return {
    total,
    semAssunto,
    assuntos: Array.from(assuntos.entries())
      .map(([nome, n]) => ({ nome, total: n, topicos: (filhos.get(nome) || []).sort(porTotal) }))
      .sort(porTotal),
  };
}

/** Link para resolver as questões do recorte na página /questions. */
export function linkQuestoes(disciplina: string, filtros: Filtros, assunto?: string, topico?: string) {
  const params = new URLSearchParams();
  params.set("disciplines", JSON.stringify([disciplina]));
  if (assunto) params.set("topics", JSON.stringify([assunto]));
  if (topico) params.set("subtopics", JSON.stringify([topico]));
  if (filtros.bancas.length) params.set("institutions", JSON.stringify(filtros.bancas));
  if (filtros.instituicoes.length) params.set("organizations", JSON.stringify(filtros.instituicoes));
  if (filtros.anos.length) params.set("years", JSON.stringify(filtros.anos));
  return `/questions?${params.toString()}`;
}
