import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Teoria, TeoriaInsert, TeoriaUpdate } from "@/integrations/supabase/types_teoria";

export type { Teoria, TeoriaInsert, TeoriaUpdate };

export const teoriasService = {
  // Criar uma nova teoria
  async createTeoria(teoria: TeoriaInsert) {
    try {
      const { data, error } = await supabase
        .from('teorias')
        .insert({
          titulo: teoria.titulo,
          disciplina_id: teoria.disciplina_id,
          assunto_id: teoria.assunto_id,
          topicos_ids: teoria.topicos_ids,
          conteudo: teoria.conteudo,
          no_edital: teoria.no_edital,
          status: teoria.status,
          professor_id: teoria.professor_id // Adicionado
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Teoria criada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar teoria:", error);
      toast.error("Erro ao criar teoria");
      throw error;
    }
  },

  // Atualizar uma teoria existente
  async updateTeoria(id: string, teoria: TeoriaUpdate) {
    try {
      const { data, error } = await supabase
        .from('teorias')
        .update({
          ...teoria,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success("Teoria atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar teoria:", error);
      toast.error("Erro ao atualizar teoria");
      throw error;
    }
  },

  // Obter todas as teorias
  async getTeorias() {
    try {
      const { data, error } = await supabase
        .from('teorias')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao buscar teorias:", error);
      toast.error("Erro ao carregar teorias");
      throw error;
    }
  },

  // Obter uma teoria por ID
  async getTeoriaById(id: string) {
    try {
      const { data, error } = await supabase
        .from('teorias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao buscar teoria:", error);
      toast.error("Erro ao carregar teoria");
      throw error;
    }
  },

  // Excluir uma teoria
  async deleteTeoria(id: string) {
    try {
      const { error } = await supabase
        .from('teorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Teoria excluída com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao excluir teoria:", error);
      toast.error("Erro ao excluir teoria");
      throw error;
    }
  }
};