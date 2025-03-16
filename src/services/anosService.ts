import { supabase } from "@/integrations/supabase/client";

export interface Ano {
  id: string;
  valor: string;
}

export const fetchAnos = async (): Promise<Ano[]> => {
  try {
    const { data, error } = await supabase
      .from('anos')
      .select('*')
      .order('valor', { ascending: false });

    if (error) {
      console.error("Erro ao buscar anos:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar anos:", error);
    return [];
  }
};

export const addAno = async (valor: string): Promise<Ano | null> => {
  try {
    const { data, error } = await supabase
      .from('anos')
      .insert([{ valor }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar ano:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar ano:", error);
    return null;
  }
};

export const updateAno = async (id: string, valor: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('anos')
      .update({ valor })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar ano:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar ano:", error);
    return false;
  }
};

export const deleteAno = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('anos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir ano:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir ano:", error);
    return false;
  }
};
