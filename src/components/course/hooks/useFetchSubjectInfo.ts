import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  videoUrl: string;
  isActive: boolean;
}

export const useFetchSubjectInfo = (subjectId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extrair a função fetchSubjectInfo para ser exportada
  const fetchSubjectInfo = async (subjId: string): Promise<string[]> => {
    try {
      if (!subjId) {
        return [];
      }
      
      // Buscar aulas relacionadas ao assunto
      const { data, error } = await supabase
        .from('disciplinas')
        .select('aulas_ids')
        .eq('id', subjId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar aulas da disciplina:', error);
        return [];
      }
      
      // Retornar o array de IDs na ordem correta
      return Array.isArray(data?.aulas_ids) ? data.aulas_ids : [];
    } catch (error) {
      console.error('Erro ao buscar informações do assunto:', error);
      return [];
    }
  };

  const fetchLessons = async () => {
    if (!subjectId) {
      setLoading(false);
      setLessons([]);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar aulas relacionadas ao assunto usando a função extraída
      const aulasIds = await fetchSubjectInfo(subjectId);
      
      if (aulasIds.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }
      
      // Buscar detalhes das aulas
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .in('id', aulasIds);
        
      if (aulasError) {
        throw aulasError;
      }

      // Ordenar as aulas de acordo com a ordem em aulasIds
      const aulasOrdenadas = aulasIds
        .map(id => aulasData?.find(aula => aula.id === id))
        .filter((aula): aula is NonNullable<typeof aula> => aula != null);
      
      // Transformar os dados em um formato adequado para o componente
      const formattedLessons = await Promise.all(aulasOrdenadas.map(async (aula) => {
        let sections: Section[] = [];
        
        if (aula.topicos_ids && aula.topicos_ids.length > 0) {
          const { data: topicosData, error: topicosError } = await supabase
            .from('topicos')
            .select('*')
            .in('id', aula.topicos_ids);
            
          if (topicosError) {
            console.error('Erro ao buscar tópicos:', topicosError);
          } else {
            sections = aula.topicos_ids
              .map(id => topicosData?.find(topico => topico.id === id))
              .filter((topico): topico is NonNullable<typeof topico> => topico != null)
              .map(topico => ({
                id: topico.id,
                title: topico.nome,
                videoUrl: topico.video_url || '',
                isActive: false // Será atualizado pelo progresso do usuário
              }));
          }
        }
        
        return {
          id: aula.id,
          title: aula.titulo,
          description: aula.descricao,
          sections: sections
        };
      }));
      
      setLessons(formattedLessons);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  return { lessons, loading, error, fetchSubjectInfo };
};
