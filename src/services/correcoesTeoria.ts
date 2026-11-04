import { supabase } from "@/integrations/supabase/client";

/**
 * Correções de trechos das teorias sugeridas por usuários.
 *
 * Usuários só gravam em `teoria_correcoes`. O texto da teoria muda apenas
 * pela RPC `aprovar_correcao_teoria`, que o banco só executa para
 * administradores (migration 20251108000000_topicos_teoria_e_correcoes.sql).
 */

export type StatusCorrecao = "pendente" | "aprovado" | "rejeitado";

export interface CorrecaoTeoria {
  id: string;
  created_at: string;
  teoria_id: string;
  autor_id: string;
  status: StatusCorrecao;
  trecho_original: string;
  trecho_corrigido: string;
  justificativa: string | null;
  revisado_em: string | null;
  motivo_rejeicao: string | null;
  aplicada_no_texto: boolean | null;
}

export interface TeoriaResumo {
  id: string;
  titulo: string;
  slug?: string;
  conteudo?: string;
}

// A tabela nova ainda não está nos tipos gerados do Supabase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const COLUNAS =
  "id, created_at, teoria_id, autor_id, status, trecho_original, trecho_corrigido, justificativa, revisado_em, motivo_rejeicao, aplicada_no_texto";

export const LIMITE_TRECHO = 3000;
export const LIMITE_CORRECAO = 5000;

export const enviarCorrecao = async (input: {
  teoria_id: string;
  trecho_original: string;
  trecho_corrigido: string;
  justificativa?: string;
}): Promise<void> => {
  const { error } = await db.from("teoria_correcoes").insert({
    teoria_id: input.teoria_id,
    trecho_original: input.trecho_original.trim(),
    trecho_corrigido: input.trecho_corrigido.trim(),
    justificativa: input.justificativa?.trim() || null,
  });
  if (error) throw error;
};

export const listarMinhasCorrecoes = async (userId: string): Promise<CorrecaoTeoria[]> => {
  const { data, error } = await db
    .from("teoria_correcoes")
    .select(COLUNAS)
    .eq("autor_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data || [];
};

export const listarCorrecoes = async (status: StatusCorrecao | "todos"): Promise<CorrecaoTeoria[]> => {
  let query = db
    .from("teoria_correcoes")
    .select(COLUNAS)
    .order("created_at", { ascending: status === "pendente" })
    .limit(200);
  if (status !== "todos") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const excluirCorrecao = async (id: string): Promise<void> => {
  const { error } = await db.from("teoria_correcoes").delete().eq("id", id);
  if (error) throw error;
};

export const buscarTeorias = async (ids: string[], comConteudo = false): Promise<Record<string, TeoriaResumo>> => {
  if (ids.length === 0) return {};
  const { data, error } = await db
    .from("teorias")
    .select(comConteudo ? "id, titulo, slug, conteudo" : "id, titulo, slug")
    .in("id", ids);
  if (error) throw error;
  const mapa: Record<string, TeoriaResumo> = {};
  (data || []).forEach((t: TeoriaResumo) => {
    mapa[t.id] = t;
  });
  return mapa;
};

/** Aprova. Com `conteudoNovo`, grava o texto corrigido; sem ele, só marca como aprovada. */
export const aprovarCorrecao = async (
  id: string,
  conteudoNovo: string | null,
  conteudoAnterior: string | null
): Promise<void> => {
  const { error } = await db.rpc("aprovar_correcao_teoria", {
    p_id: id,
    p_conteudo_novo: conteudoNovo,
    p_conteudo_anterior: conteudoAnterior,
  });
  if (error) throw error;
};

export const rejeitarCorrecao = async (id: string, motivo: string): Promise<void> => {
  const { error } = await db.rpc("rejeitar_correcao_teoria", { p_id: id, p_motivo: motivo });
  if (error) throw error;
};

export interface ContribuidorTeoria {
  nome: string;
  total_correcoes: number;
}

export interface RankingContribuidor {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_correcoes: number;
  total_teorias: number;
  ultima_contribuicao: string | null;
}

/** Autores de correções aprovadas, para os créditos no fim da teoria. */
export const listarContribuidoresTeoria = async (teoriaId: string): Promise<ContribuidorTeoria[]> => {
  const { data, error } = await db.rpc("contribuidores_teoria", { p_teoria_id: teoriaId });
  if (error) throw error;
  return data || [];
};

export const buscarRankingContribuicoes = async (limite = 100): Promise<RankingContribuidor[]> => {
  const { data, error } = await db.rpc("ranking_contribuicoes_teorias", { p_limite: limite });
  if (error) throw error;
  return data || [];
};
