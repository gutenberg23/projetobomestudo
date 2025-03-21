
import { supabase } from '@/integrations/supabase/client';

// Define explicit types for Supabase results
interface AulaResult {
  id: string;
}

interface DisciplinaResult {
  aulas_ids?: string[];
}

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

  return data?.map(aula => aula.id as string) ?? [];
};

export const useFetchSubjectInfo = () => {
  const fetchSubjectInfo = async (subjectId: string): Promise<string[]> => {
    try {
      // Buscar disciplina e obter aulas_ids
      const { data: disciplinaData, error: disciplinaError } = await supabase
        .from('disciplinas')
        .select('aulas_ids')
        .eq('id', subjectId)
        .maybeSingle();

      if (disciplinaError) {
        console.error('Erro ao buscar disciplina:', disciplinaError);
        return [];
      }

      if (disciplinaData?.aulas_ids && disciplinaData.aulas_ids.length > 0) {
        return disciplinaData.aulas_ids as string[];
      }

      // Buscar por aulas relacionadas ao subjectId
      return await fetchAulasByField('disciplina_id', subjectId);
    } catch (error) {
      console.error('Erro ao buscar informações da disciplina:', error);
      return [];
    }
  };

  return { fetchSubjectInfo };
};
