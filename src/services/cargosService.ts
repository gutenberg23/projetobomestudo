import { supabase } from "@/integrations/supabase/client";

export interface Cargo {
  id: string;
  nome: string;
}

export const fetchCargos = async (): Promise<Cargo[]> => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar cargos:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar cargos:", error);
    return [];
  }
};

export const addCargo = async (nome: string): Promise<Cargo | null> => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar cargo:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar cargo:", error);
    return null;
  }
};

export const updateCargo = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cargos')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar cargo:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar cargo:", error);
    return false;
  }
};

export const deleteCargo = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cargos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir cargo:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir cargo:", error);
    return false;
  }
};
