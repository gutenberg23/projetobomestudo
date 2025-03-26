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
      console.log('Buscando aulas com IDs:', aulaIds);
      
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select('id, titulo, questoes_ids, topicos_ids')
        .in('id', aulaIds);

      if (error || !aulasData || aulasData.length === 0) {
        console.error('Erro ao buscar aulas por IDs:', error);
        return [];
      }

      console.log('Aulas encontradas:', aulasData);

      return aulasData.map(aula => ({
        id: String(aula.id),
        titulo: String(aula.titulo),
        questoes_ids: aula.questoes_ids ? aula.questoes_ids.map(String) : [],
        topicos_ids: aula.topicos_ids ? aula.topicos_ids.map(String) : []
      }));
    } catch (error) {
      console.error('Erro ao buscar aulas por IDs:', error);
      return [];
    }
  };

  return { fetchLessonsByIds, loading, setLoading };
};
