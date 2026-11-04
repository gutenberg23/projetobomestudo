import { supabase } from "@/integrations/supabase/client";
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { filtersFromColumns, hasAnyFilter, parseQuestionsLink } from "@/utils/editalQuestionFilters";

/**
 * Editais verticalizados (tabela cursoverticalizado) e as disciplinas que eles
 * usam (tabela disciplinaverticalizada). Uma disciplina pode estar em vários
 * editais; o progresso do aluno fica guardado por disciplina e pela posição do
 * tópico dentro dela.
 */

export interface FiltroTopico {
  disciplinas: string[];
  assuntos: string[];
  topicos: string[];
  bancas: string[];
}

export interface TopicoEdital {
  /** Chave local, só para a lista do formulário. */
  chave: string;
  nome: string;
  link: string;
  filtros: FiltroTopico;
  quantidade: number;
}

export interface DisciplinaEdital {
  id: string;
  titulo: string;
  descricao: string;
  topicos: TopicoEdital[];
  createdAt: string | null;
}

export type DadosDisciplina = Omit<DisciplinaEdital, "id" | "createdAt">;

export interface EditalVerticalizado {
  id: string;
  titulo: string;
  cursoId: string;
  disciplinasIds: string[];
  ativo: boolean;
  createdAt: string | null;
}

export type DadosEdital = Omit<EditalVerticalizado, "id" | "createdAt">;

export interface CursoResumo {
  id: string;
  titulo: string;
  descricao: string;
}

export const FILTRO_VAZIO: FiltroTopico = { disciplinas: [], assuntos: [], topicos: [], bancas: [] };

let contador = 0;
export const novaChave = () => `t${Date.now().toString(36)}${(contador++).toString(36)}`;

export const temFiltro = (f: FiltroTopico) => f.disciplinas.length + f.assuntos.length + f.topicos.length + f.bancas.length > 0;

/** Mesmo formato de link que a página /questions entende. */
export function montarLinkQuestoes(f: FiltroTopico): string {
  if (!temFiltro(f)) return "";
  const params = new URLSearchParams();
  if (f.disciplinas.length) params.set("disciplines", JSON.stringify(f.disciplinas));
  if (f.assuntos.length) params.set("topics", JSON.stringify(f.assuntos));
  if (f.bancas.length) params.set("institutions", JSON.stringify(f.bancas));
  if (f.topicos.length) params.set("subtopics", JSON.stringify(f.topicos));
  params.set("perPage", "10");
  return `/questions?${params.toString()}`;
}

export const linkDoCurso = (c: { id: string; titulo: string }) => `/course/${generateFriendlyUrl(c.titulo || "curso", c.id)}`;

type LinhaDisciplina = {
  id: string;
  titulo: string;
  descricao: string | null;
  topicos: string[] | null;
  links: string[] | null;
  assuntos: string[] | null;
  topicos_filtro: string[] | null;
  disciplinas_filtro: string[] | null;
  bancas_filtro: string[] | null;
  quantidade_questoes_filtro: number[] | null;
  created_at: string | null;
};

function paraDisciplina(d: LinhaDisciplina): DisciplinaEdital {
  const nomes = d.topicos || [];
  return {
    id: d.id,
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    createdAt: d.created_at,
    topicos: nomes.map((nome, i) => {
      // O link é a fonte da verdade (é o que o aluno abre); as colunas são o reserva
      const link = d.links?.[i] || "";
      const doLink = parseQuestionsLink(link);
      const base = doLink && hasAnyFilter(doLink) ? doLink : filtersFromColumns(d, i);
      return {
        chave: novaChave(),
        nome,
        link,
        filtros: { disciplinas: base.disciplines, assuntos: base.topics, topicos: base.subtopics, bancas: base.institutions },
        quantidade: d.quantidade_questoes_filtro?.[i] || 0,
      };
    }),
  };
}

function paraLinhaDisciplina(d: DadosDisciplina) {
  const topicos = d.topicos.filter((t) => t.nome.trim());
  const juntar = (lista: string[]) => lista.join("|");
  return {
    titulo: d.titulo.trim(),
    descricao: d.descricao.trim(),
    topicos: topicos.map((t) => t.nome.trim()),
    links: topicos.map((t) => (temFiltro(t.filtros) ? montarLinkQuestoes(t.filtros) : t.link.trim())),
    assuntos: topicos.map((t) => juntar(t.filtros.assuntos)),
    topicos_filtro: topicos.map((t) => juntar(t.filtros.topicos)),
    disciplinas_filtro: topicos.map((t) => juntar(t.filtros.disciplinas)),
    bancas_filtro: topicos.map((t) => juntar(t.filtros.bancas)),
    quantidade_questoes_filtro: topicos.map((t) => t.quantidade || 0),
  };
}

function paraEdital(e: { id: string; titulo: string; curso_id: string; disciplinas_ids: string[] | null; ativo: boolean | null; created_at: string | null }): EditalVerticalizado {
  return {
    id: e.id,
    titulo: e.titulo || "",
    cursoId: e.curso_id,
    disciplinasIds: e.disciplinas_ids || [],
    ativo: e.ativo !== false,
    createdAt: e.created_at,
  };
}

/* --------------------------------------------------------------- leitura */

export async function listarEditais(): Promise<EditalVerticalizado[]> {
  const { data, error } = await supabase.from("cursoverticalizado").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(paraEdital);
}

export async function listarDisciplinas(): Promise<DisciplinaEdital[]> {
  const todas: LinhaDisciplina[] = [];
  for (let inicio = 0; ; inicio += 1000) {
    const { data, error } = await supabase
      .from("disciplinaverticalizada")
      .select("*")
      .order("created_at", { ascending: false })
      .range(inicio, inicio + 999);
    if (error) throw error;
    todas.push(...((data || []) as LinhaDisciplina[]));
    if (!data || data.length < 1000) break;
  }
  return todas.map(paraDisciplina);
}

export async function listarCursos(): Promise<CursoResumo[]> {
  const { data, error } = await supabase.from("cursos").select("id, titulo, descricao").order("titulo");
  if (error) throw error;
  return (data || []).map((c) => ({ id: c.id, titulo: c.titulo || "", descricao: c.descricao || "" }));
}

/* ----------------------------------------------------------- disciplinas */

export async function criarDisciplina(d: DadosDisciplina): Promise<DisciplinaEdital> {
  const { data, error } = await supabase.from("disciplinaverticalizada").insert(paraLinhaDisciplina(d)).select("*").single();
  if (error) throw error;
  return paraDisciplina(data as LinhaDisciplina);
}

export async function atualizarDisciplina(id: string, d: DadosDisciplina): Promise<DisciplinaEdital> {
  const { data, error } = await supabase.from("disciplinaverticalizada").update(paraLinhaDisciplina(d)).eq("id", id).select("*").single();
  if (error) throw error;
  return paraDisciplina(data as LinhaDisciplina);
}

/** Exclui a disciplina e a tira dos editais que a usam. */
export async function excluirDisciplina(id: string, editais: EditalVerticalizado[]): Promise<void> {
  for (const e of editais.filter((x) => x.disciplinasIds.includes(id))) {
    const { error } = await supabase
      .from("cursoverticalizado")
      .update({ disciplinas_ids: e.disciplinasIds.filter((x) => x !== id) })
      .eq("id", e.id);
    if (error) throw error;
  }
  const { error } = await supabase.from("disciplinaverticalizada").delete().eq("id", id);
  if (error) throw error;
}

/* --------------------------------------------------------------- editais */

export async function criarEdital(d: DadosEdital): Promise<EditalVerticalizado> {
  const { data, error } = await supabase
    .from("cursoverticalizado")
    .insert({ titulo: d.titulo.trim(), curso_id: d.cursoId, disciplinas_ids: d.disciplinasIds, ativo: d.ativo })
    .select("*")
    .single();
  if (error) throw error;
  return paraEdital(data);
}

export async function atualizarEdital(id: string, d: DadosEdital): Promise<EditalVerticalizado> {
  const { data, error } = await supabase
    .from("cursoverticalizado")
    .update({ titulo: d.titulo.trim(), curso_id: d.cursoId, disciplinas_ids: d.disciplinasIds, ativo: d.ativo })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return paraEdital(data);
}

export async function definirAtivoEdital(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("cursoverticalizado").update({ ativo }).eq("id", id);
  if (error) throw error;
}

export async function excluirEdital(id: string): Promise<void> {
  const { error } = await supabase.from("cursoverticalizado").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------- apoio */

/** Quantas questões o link do tópico mostra (mesmos filtros da página /questions). */
export async function contarQuestoes(f: FiltroTopico): Promise<number> {
  let q = supabase.from("questoes").select("id", { count: "exact", head: true });
  if (f.disciplinas.length) q = q.in("discipline", f.disciplinas);
  if (f.assuntos.length) q = q.overlaps("assuntos", f.assuntos);
  if (f.topicos.length) q = q.overlaps("topicos", f.topicos);
  if (f.bancas.length) q = q.in("institution", f.bancas);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

/**
 * Separa uma lista de tópicos colada do edital. Aceita uma por linha,
 * "1. Tópico 2. Tópico", "1 Tópico 2 Tópico" e "Tópico; Tópico".
 */
export function separarTopicosColados(texto: string): string[] {
  const bruto = (texto || "").replace(/\r/g, "").trim();
  if (!bruto) return [];
  const limpar = (t: string) => t.replace(/^\s*(?:\d+(?:\.\d+)*[.)\-–]?|[-•*])\s+/, "").replace(/[.;]+$/, "").replace(/\s+/g, " ").trim();

  // Uma por linha, quando a maioria das linhas parece um item
  const linhas = bruto.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const comMarcador = linhas.filter((l) => /^\s*(?:\d+(?:\.\d+)*[.)\-–]?\s|[-•*]\s)/.test(l)).length;
  if (linhas.length > 1 && comMarcador >= linhas.length / 2) {
    // Junta continuações de linha (texto quebrado no meio do item)
    const itens: string[] = [];
    for (const l of linhas) {
      if (/^\s*(?:\d+(?:\.\d+)*[.)\-–]?\s|[-•*]\s)/.test(l) || itens.length === 0) itens.push(l);
      else itens[itens.length - 1] += ` ${l}`;
    }
    return itens.map(limpar).filter(Boolean);
  }

  const corrido = bruto.replace(/\s*\n\s*/g, " ");
  let partes: string[];
  if (/(?:^|\s)\d+(?:\.\d+)*\.\s+/.test(corrido)) partes = corrido.split(/(?:^|\s)(?=\d+(?:\.\d+)*\.\s+)/);
  else if (/(?:^|\s)\d+\s+[A-Za-zÀ-ÿ]/.test(corrido)) partes = corrido.split(/(?:^|\s)(?=\d+\s+[A-Za-zÀ-ÿ])/);
  else if (corrido.includes(";")) partes = corrido.split(";");
  else if (linhas.length > 1) partes = linhas;
  else partes = corrido.split(/\.\s+(?=[A-ZÀ-Ý])/);
  return partes.map(limpar).filter(Boolean);
}
