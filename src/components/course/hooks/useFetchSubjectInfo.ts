
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

  return (data as AulaResult[] || []).map(aula => aula.id);
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
      }

      const typedData = disciplinaData as DisciplinaResult | null;
      if (typedData?.aulas_ids?.length) {
        return typedData.aulas_ids;
      }

      // Buscar aulas por diferentes campos
      const campos = ['disciplina_id', 'id_disciplina', 'disciplina'];
      for (const campo of campos) {
        const aulas = await fetchAulasByField(campo, subjectId);
        if (aulas.length > 0) return aulas;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar informações da disciplina:', error);
      return [];
    }
  };

  return { fetchSubjectInfo };
};
