
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAula } from '../types/lessonTypes';

export const useFetchLessonsByIds = () => {
  const [loading, setLoading] = useState(false);

  const fetchLessonsByIds = async (aulaIds: string[]): Promise<SimpleAula[]> => {
    if (!aulaIds || aulaIds.length === 0) {
      return [];
    }

    try {
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select('*')
        .in('id', aulaIds);

      if (error || !aulasData || aulasData.length === 0) {
        console.error('Erro ao buscar aulas por IDs:', error);
        return [];
      }

      return aulasData.map(aula => ({
        id: String(aula.id),
        titulo: String(aula.titulo),
        questoes_ids: aula.questoes_ids ? aula.questoes_ids.map(String) : []
      }));
    } catch (error) {
      console.error('Erro ao buscar aulas por IDs:', error);
      return [];
    }
  };

  return { fetchLessonsByIds, loading, setLoading };
};
