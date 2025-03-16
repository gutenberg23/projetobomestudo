import { supabase } from "@/integrations/supabase/client";

export interface Nivel {
  id: string;
  nome: string;
}

export const fetchNiveis = async (): Promise<Nivel[]> => {
  try {
    const { data, error } = await supabase
      .from('niveis')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar níveis:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar níveis:", error);
    return [];
  }
};

export const addNivel = async (nome: string): Promise<Nivel | null> => {
  try {
    const { data, error } = await supabase
      .from('niveis')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar nível:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar nível:", error);
    return null;
  }
};

export const updateNivel = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('niveis')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar nível:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar nível:", error);
    return false;
  }
};

export const deleteNivel = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('niveis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir nível:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir nível:", error);
    return false;
  }
};
