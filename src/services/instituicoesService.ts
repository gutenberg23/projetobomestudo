import { supabase } from "@/integrations/supabase/client";

export interface Instituicao {
  id: string;
  nome: string;
}

export const fetchInstituicoes = async (): Promise<Instituicao[]> => {
  try {
    const { data, error } = await supabase
      .from('instituicoes')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar instituições:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar instituições:", error);
    return [];
  }
};

export const addInstituicao = async (nome: string): Promise<Instituicao | null> => {
  try {
    const { data, error } = await supabase
      .from('instituicoes')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar instituição:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar instituição:", error);
    return null;
  }
};

export const updateInstituicao = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('instituicoes')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar instituição:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar instituição:", error);
    return false;
  }
};

export const deleteInstituicao = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('instituicoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir instituição:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir instituição:", error);
    return false;
  }
};
