
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Lesson = {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
};

export type Section = {
  id: string;
  title: string;
  content?: string;
  isActive?: boolean;
  videoUrl?: string;
};

export const useFetchSubjectInfo = (subjectId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectInfo = async () => {
      if (!subjectId) {
        setLoading(false);
        setLessons([]);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar aulas relacionadas ao assunto
        const { data: disciplinaData, error: disciplinaError } = await supabase
          .from('disciplinas')
          .select('aulas_ids, titulo')
          .eq('id', subjectId)
          .single();
          
        if (disciplinaError) {
          throw disciplinaError;
        }
        
        if (!disciplinaData?.aulas_ids || disciplinaData.aulas_ids.length === 0) {
          setLessons([]);
          setLoading(false);
          return;
        }
        
        // Buscar detalhes das aulas
        const { data: aulasData, error: aulasError } = await supabase
          .from('aulas')
          .select('*')
          .in('id', disciplinaData.aulas_ids);
          
        if (aulasError) {
          throw aulasError;
        }
        
        // Transformar os dados em um formato adequado para o componente
        const formattedLessons = await Promise.all((aulasData || []).map(async (aula) => {
          let sections: Section[] = [];
          
          if (aula.topicos_ids && aula.topicos_ids.length > 0) {
            const { data: topicosData, error: topicosError } = await supabase
              .from('topicos')
              .select('*')
              .in('id', aula.topicos_ids);
              
            if (topicosError) {
              console.error('Erro ao buscar tópicos:', topicosError);
            } else {
              sections = (topicosData || []).map(topico => ({
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
        console.error('Erro ao buscar informações do assunto:', error);
        setError('Não foi possível carregar as informações do assunto.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjectInfo();
  }, [subjectId]);

  return { lessons, loading, error };
};
