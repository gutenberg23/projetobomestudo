import { supabase } from "@/integrations/supabase/client";

export interface Banca {
  id: string;
  nome: string;
}

export const fetchBancas = async (): Promise<Banca[]> => {
  try {
    const { data, error } = await supabase
      .from('bancas')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar bancas:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar bancas:", error);
    return [];
  }
};

export const addBanca = async (nome: string): Promise<Banca | null> => {
  try {
    const { data, error } = await supabase
      .from('bancas')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar banca:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar banca:", error);
    return null;
  }
};

export const updateBanca = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bancas')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar banca:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar banca:", error);
    return false;
  }
};

export const deleteBanca = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bancas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir banca:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir banca:", error);
    return false;
  }
};
