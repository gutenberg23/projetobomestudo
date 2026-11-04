import { supabase } from "@/integrations/supabase/client";
import type { Teoria, TeoriaInsert, TeoriaUpdate } from "@/integrations/supabase/types_teoria";

export type { Teoria, TeoriaInsert, TeoriaUpdate };

/** Teoria sem o texto da aula, para listagens. */
export type TeoriaResumoAdmin = Omit<Teoria, "conteudo" | "no_edital"> & {
  id: string;
  created_at: string;
  updated_at: string;
};

const COLUNAS_RESUMO =
  "id, slug, titulo, disciplina_id, assunto_id, topicos_ids, status, professor_id, created_at, updated_at, questoes_filtros, questoes_link, videoaulas, mapas_mentais";

// A coluna slug ainda não está nos tipos gerados do Supabase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/**
 * Acesso à tabela `teorias`. As mensagens para o usuário ficam com as telas;
 * aqui os erros só são registrados e repassados.
 */
export const teoriasService = {
  async createTeoria(teoria: TeoriaInsert): Promise<Teoria> {
    const { data, error } = await db
      .from("teorias")
      .insert({
        titulo: teoria.titulo,
        slug: teoria.slug || null,
        disciplina_id: teoria.disciplina_id,
        assunto_id: teoria.assunto_id,
        topicos_ids: teoria.topicos_ids,
        conteudo: teoria.conteudo,
        no_edital: teoria.no_edital,
        status: teoria.status,
        professor_id: teoria.professor_id,
        questoes_filtros: teoria.questoes_filtros,
        questoes_link: teoria.questoes_link,
        videoaulas: teoria.videoaulas,
        mapas_mentais: teoria.mapas_mentais,
      })
      .select()
      .single();
    if (error) {
      console.error("Erro ao criar teoria:", error);
      throw error;
    }
    return data;
  },

  async updateTeoria(id: string, teoria: TeoriaUpdate): Promise<Teoria> {
    const { data, error } = await db
      .from("teorias")
      .update({ ...teoria, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Erro ao atualizar teoria:", error);
      throw error;
    }
    return data;
  },

  /** Todas as teorias, sem o conteúdo, das mais recentes para as mais antigas. */
  async getTeorias(): Promise<TeoriaResumoAdmin[]> {
    const { data, error } = await db.from("teorias").select(COLUNAS_RESUMO).order("updated_at", { ascending: false });
    if (error) {
      console.error("Erro ao buscar teorias:", error);
      throw error;
    }
    return data || [];
  },

  async getTeoriaById(id: string): Promise<Teoria & { id: string }> {
    const { data, error } = await db.from("teorias").select("*").eq("id", id).single();
    if (error) {
      console.error("Erro ao buscar teoria:", error);
      throw error;
    }
    return data;
  },

  async getConteudo(id: string): Promise<Pick<Teoria, "conteudo" | "no_edital">> {
    const { data, error } = await db.from("teorias").select("conteudo, no_edital").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async deleteTeoria(id: string): Promise<true> {
    const { error } = await db.from("teorias").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir teoria:", error);
      throw error;
    }
    return true;
  },
};
