import { supabase } from "@/integrations/supabase/client";

/**
 * Contribuições de usuários (tópicos, aulas, disciplinas e cursos).
 *
 * Usuários comuns só escrevem em `conteudo_submissoes`. A publicação nas
 * tabelas reais acontece exclusivamente pela RPC `aprovar_submissao`, que o
 * banco só executa para administradores (ver migration
 * 20251106000000_conteudo_submissoes.sql).
 */

export type TipoSubmissao = "topico" | "aula" | "disciplina" | "curso";
export type StatusSubmissao = "pendente" | "aprovado" | "rejeitado";

export interface DadosTopico {
  disciplina?: string;
  video_url?: string;
  pdf_url?: string;
  mapa_url?: string;
  resumo_url?: string;
  musica_url?: string;
  resumo_audio_url?: string;
  caderno_questoes_url?: string;
  questoes_ids?: string[];
  abrir_em_nova_guia?: boolean;
}

export interface DadosSubmissao extends DadosTopico {
  banca?: string;
  informacoes_curso?: string;
}

export interface Submissao {
  id: string;
  created_at: string;
  updated_at: string;
  tipo: TipoSubmissao;
  status: StatusSubmissao;
  autor_id: string;
  titulo: string;
  descricao: string | null;
  dados: DadosSubmissao;
  itens_ids: string[];
  itens_submissao_ids: string[];
  destino_id: string | null;
  revisado_por: string | null;
  revisado_em: string | null;
  motivo_rejeicao: string | null;
  conteudo_publicado_id: string | null;
}

export interface SubmissaoInput {
  tipo: TipoSubmissao;
  titulo: string;
  descricao?: string | null;
  dados: DadosSubmissao;
  itens_ids: string[];
  itens_submissao_ids: string[];
  destino_id?: string | null;
}

export interface ContribuicoesConfig {
  habilitado: boolean;
  limite_pendentes: number;
  limite_diario: number;
}

export interface ItemPublicado {
  id: string;
  titulo: string;
}

export const TIPO_LABEL: Record<TipoSubmissao, string> = {
  topico: "Tópico",
  aula: "Aula",
  disciplina: "Disciplina",
  curso: "Curso",
};

export const STATUS_LABEL: Record<StatusSubmissao, string> = {
  pendente: "Aguardando análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

/** Tipo dos itens que compõem cada tipo de conteúdo. */
export const TIPO_FILHO: Record<TipoSubmissao, TipoSubmissao | null> = {
  topico: null,
  aula: "topico",
  disciplina: "aula",
  curso: "disciplina",
};

/** Tipo do item onde o conteúdo pode ser anexado. */
export const TIPO_DESTINO: Record<TipoSubmissao, TipoSubmissao | null> = {
  topico: "aula",
  aula: "disciplina",
  disciplina: "curso",
  curso: null,
};

const TABELA: Record<TipoSubmissao, { tabela: string; coluna: string }> = {
  topico: { tabela: "topicos", coluna: "nome" },
  aula: { tabela: "aulas", coluna: "titulo" },
  disciplina: { tabela: "disciplinas", coluna: "titulo" },
  curso: { tabela: "cursos", coluna: "titulo" },
};

// A tabela nova ainda não está nos tipos gerados do Supabase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const SUBMISSAO_COLUNAS =
  "id, created_at, updated_at, tipo, status, autor_id, titulo, descricao, dados, itens_ids, itens_submissao_ids, destino_id, revisado_por, revisado_em, motivo_rejeicao, conteudo_publicado_id";

/** Converte mensagens do Postgres/PostgREST em texto amigável. */
export const mensagemErro = (error: unknown): string => {
  const e = error as { message?: string; code?: string } | null;
  if (!e) return "Erro desconhecido";
  if (e.code === "42501") return "Você não tem permissão para esta ação.";
  return e.message || "Erro desconhecido";
};

export const listarMinhasSubmissoes = async (userId: string): Promise<Submissao[]> => {
  const { data, error } = await db
    .from("conteudo_submissoes")
    .select(SUBMISSAO_COLUNAS)
    .eq("autor_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data || [];
};

export const listarSubmissoes = async (filtros: {
  status?: StatusSubmissao | "todos";
  tipo?: TipoSubmissao | "todos";
}): Promise<Submissao[]> => {
  let query = db
    .from("conteudo_submissoes")
    .select(SUBMISSAO_COLUNAS)
    .order("created_at", { ascending: filtros.status === "pendente" })
    .limit(200);
  if (filtros.status && filtros.status !== "todos") query = query.eq("status", filtros.status);
  if (filtros.tipo && filtros.tipo !== "todos") query = query.eq("tipo", filtros.tipo);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const buscarSubmissoesPorIds = async (ids: string[]): Promise<Submissao[]> => {
  if (ids.length === 0) return [];
  const { data, error } = await db
    .from("conteudo_submissoes")
    .select(SUBMISSAO_COLUNAS)
    .in("id", ids);
  if (error) throw error;
  return data || [];
};

const limparPayload = (input: SubmissaoInput) => {
  const dados: Record<string, unknown> = {};
  Object.entries(input.dados || {}).forEach(([chave, valor]) => {
    if (valor === undefined || valor === null) return;
    if (typeof valor === "string" && valor.trim() === "") return;
    if (Array.isArray(valor) && valor.length === 0) return;
    dados[chave] = typeof valor === "string" ? valor.trim() : valor;
  });
  return {
    titulo: input.titulo.trim(),
    descricao: input.descricao?.trim() || null,
    dados,
    itens_ids: input.itens_ids,
    itens_submissao_ids: input.itens_submissao_ids,
    destino_id: input.destino_id || null,
  };
};

export const criarSubmissao = async (input: SubmissaoInput): Promise<Submissao> => {
  // autor_id e status são definidos pelo banco; não enviamos daqui.
  const { data, error } = await db
    .from("conteudo_submissoes")
    .insert({ tipo: input.tipo, ...limparPayload(input) })
    .select(SUBMISSAO_COLUNAS)
    .single();
  if (error) throw error;
  return data;
};

export const atualizarSubmissao = async (id: string, input: SubmissaoInput): Promise<Submissao> => {
  const { data, error } = await db
    .from("conteudo_submissoes")
    .update(limparPayload(input))
    .eq("id", id)
    .select(SUBMISSAO_COLUNAS)
    .single();
  if (error) throw error;
  return data;
};

export const excluirSubmissao = async (id: string): Promise<void> => {
  const { error } = await db.from("conteudo_submissoes").delete().eq("id", id);
  if (error) throw error;
};

export const aprovarSubmissao = async (id: string, incluirDependencias = true): Promise<string> => {
  const { data, error } = await db.rpc("aprovar_submissao", {
    p_id: id,
    p_incluir_dependencias: incluirDependencias,
  });
  if (error) throw error;
  return data as string;
};

export const rejeitarSubmissao = async (id: string, motivo: string): Promise<void> => {
  const { error } = await db.rpc("rejeitar_submissao", { p_id: id, p_motivo: motivo });
  if (error) throw error;
};

export const buscarNomesAutores = async (ids: string[]): Promise<Record<string, string>> => {
  if (ids.length === 0) return {};
  const { data, error } = await db.rpc("autores_submissoes", { p_ids: ids });
  if (error) throw error;
  const mapa: Record<string, string> = {};
  (data || []).forEach((linha: { id: string; nome: string }) => {
    mapa[linha.id] = linha.nome;
  });
  return mapa;
};

export const obterConfig = async (): Promise<ContribuicoesConfig> => {
  const { data, error } = await db
    .from("contribuicoes_config")
    .select("habilitado, limite_pendentes, limite_diario")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data || { habilitado: false, limite_pendentes: 20, limite_diario: 30 };
};

export const salvarConfig = async (config: ContribuicoesConfig): Promise<void> => {
  const { data, error } = await db
    .from("contribuicoes_config")
    .update(config)
    .eq("id", 1)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Você não tem permissão para alterar esta configuração.");
};

/** Escapa curingas do ILIKE para que a busca seja literal. */
const escaparBusca = (termo: string) => termo.replace(/[\\%_]/g, (c) => `\\${c}`);

export const buscarItensPublicados = async (
  tipo: TipoSubmissao,
  termo: string,
  limite = 20
): Promise<ItemPublicado[]> => {
  const { tabela, coluna } = TABELA[tipo];
  let query = db.from(tabela).select(`id, ${coluna}`).order(coluna).limit(limite);
  const t = termo.trim().slice(0, 100);
  if (t) query = query.ilike(coluna, `%${escaparBusca(t)}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row: Record<string, string>) => ({ id: String(row.id), titulo: row[coluna] }));
};

export const buscarItensPublicadosPorIds = async (
  tipo: TipoSubmissao,
  ids: string[]
): Promise<ItemPublicado[]> => {
  if (ids.length === 0) return [];
  const { tabela, coluna } = TABELA[tipo];
  const { data, error } = await db.from(tabela).select(`id, ${coluna}`).in("id", ids);
  if (error) throw error;
  return (data || []).map((row: Record<string, string>) => ({ id: String(row.id), titulo: row[coluna] }));
};

/** Somente links http(s) são aceitos (o banco valida o mesmo). */
export const linkValido = (url: string) => /^https?:\/\/[^\s<>"'`\\]+$/i.test(url.trim());

export const rotaPublicada = (tipo: TipoSubmissao, id: string): string | null => {
  if (tipo === "curso") return `/course/${id}`;
  if (tipo === "disciplina") return `/course/${id}`;
  return null;
};
