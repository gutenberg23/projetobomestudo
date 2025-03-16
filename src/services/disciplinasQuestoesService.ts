import { supabase } from "@/integrations/supabase/client";

export interface DisciplinaQuestao {
  id: string;
  nome: string;
}

export const fetchDisciplinasQuestoes = async (): Promise<DisciplinaQuestao[]> => {
  try {
    const { data, error } = await supabase
      .from('disciplinas_questoes')
      .select('*')
      .order('nome');

    if (error) {
      console.error("Erro ao buscar disciplinas de questões:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar disciplinas de questões:", error);
    return [];
  }
};

export const addDisciplinaQuestao = async (nome: string): Promise<DisciplinaQuestao | null> => {
  try {
    const { data, error } = await supabase
      .from('disciplinas_questoes')
      .insert([{ nome }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar disciplina de questão:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao adicionar disciplina de questão:", error);
    return null;
  }
};

export const updateDisciplinaQuestao = async (id: string, nome: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('disciplinas_questoes')
      .update({ nome })
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar disciplina de questão:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar disciplina de questão:", error);
    return false;
  }
};

export const deleteDisciplinaQuestao = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('disciplinas_questoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir disciplina de questão:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir disciplina de questão:", error);
    return false;
  }
};
