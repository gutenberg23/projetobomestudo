import { supabase } from "@/integrations/supabase/client";

export interface TipoQuestao {
  id: string;
  nome: string;
}

export const fetchTiposQuestao = async (): Promise<TipoQuestao[]> => {
  try {
    const { data, error } = await supabase
      .from('tipos_questao')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar tipos de questão:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar tipos de questão:", error);
    return [];
  }
};

export const addTipoQuestao = async (nome: string): Promise<TipoQuestao | null> => {
  try {
    const { data, error } = await supabase
      .from('tipos_questao')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar tipo de questão:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar tipo de questão:", error);
    return null;
  }
};

export const updateTipoQuestao = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tipos_questao')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar tipo de questão:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar tipo de questão:", error);
    return false;
  }
};

export const deleteTipoQuestao = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tipos_questao')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir tipo de questão:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir tipo de questão:", error);
    return false;
  }
};
