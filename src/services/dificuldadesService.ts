import { supabase } from "@/integrations/supabase/client";

export interface Dificuldade {
  id: string;
  nome: string;
}

export const fetchDificuldades = async (): Promise<Dificuldade[]> => {
  try {
    const { data, error } = await supabase
      .from('dificuldades')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar dificuldades:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar dificuldades:", error);
    return [];
  }
};

export const addDificuldade = async (nome: string): Promise<Dificuldade | null> => {
  try {
    const { data, error } = await supabase
      .from('dificuldades')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar dificuldade:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar dificuldade:", error);
    return null;
  }
};

export const updateDificuldade = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dificuldades')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar dificuldade:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar dificuldade:", error);
    return false;
  }
};

export const deleteDificuldade = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dificuldades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir dificuldade:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir dificuldade:", error);
    return false;
  }
};
