
import { supabase } from '@/integrations/supabase/client';

export const useFetchSubjectInfo = () => {
  const fetchSubjectInfo = async (subjectId: string) => {
    try {
      // Buscar aulas_ids na tabela disciplinas
      const { data: disciplinaData, error: disciplinaError } = await supabase
        .from('disciplinas')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (disciplinaData && !disciplinaError) {
        const aulas_ids = disciplinaData.aulas_ids || [];
        if (Array.isArray(aulas_ids) && aulas_ids.length > 0) {
          return aulas_ids.map(id => String(id));
        }
      }

      // Tentar buscar por disciplina_id
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('id')
        .eq('disciplina_id', subjectId);

      if (aulasData && aulasData.length > 0 && !aulasError) {
        return aulasData.map(aula => String(aula.id));
      }

      // Tentar buscar por id_disciplina
      const { data: aulasData2, error: aulasError2 } = await supabase
        .from('aulas')
        .select('id')
        .eq('id_disciplina', subjectId);

      if (aulasData2 && aulasData2.length > 0 && !aulasError2) {
        return aulasData2.map(aula => String(aula.id));
      }

      // Tentar buscar por disciplina
      const { data: aulasData3, error: aulasError3 } = await supabase
        .from('aulas')
        .select('id')
        .eq('disciplina', subjectId);

      if (aulasData3 && aulasData3.length > 0 && !aulasError3) {
        return aulasData3.map(aula => String(aula.id));
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
