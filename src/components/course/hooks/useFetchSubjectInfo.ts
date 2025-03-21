import { supabase } from '@/integrations/supabase/client';

type AulaResult = { id: string };

// Função auxiliar para buscar aulas por diferentes campos
const fetchAulasByField = async (field: string, value: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('aulas')
    .select('id')
    .eq(field, value);

  if (error) {
    console.error(`Erro ao buscar aulas por ${field}:`, error);
    return [];
  }

  return (data ?? []).map((aula: AulaResult) => aula.id);
};

export const useFetchSubjectInfo = () => {
  const fetchSubjectInfo = async (subjectId: string): Promise<string[]> => {
    try {
      // Buscar disciplina e obter aulas_ids
      const { data: disciplinaData, error: disciplinaError } = await supabase
        .from('disciplinas')
        .select('aulas_ids')
        .eq('id', subjectId)
        .single();

      if (disciplinaError) {
        console.error('Erro ao buscar disciplina:', disciplinaError);
      }

      if (disciplinaData?.aulas_ids && Array.isArray(disciplinaData.aulas_ids) && disciplinaData.aulas_ids.length > 0) {
        return disciplinaData.aulas_ids.map(String);
      }

      // Tentar buscar por diferentes campos na tabela 'aulas'
      for (const field of ['disciplina_id', 'id_disciplina', 'disciplina']) {
        const aulas = await fetchAulasByField(field, subjectId);
        if (aulas.length > 0) return aulas;
      }

      console.log('Nenhuma aula encontrada para a disciplina:', subjectId);
      return [];
    } catch (error) {
      console.error('Erro ao buscar informações da disciplina:', error);
      return [];
    }
  };

  return { fetchSubjectInfo };
};
