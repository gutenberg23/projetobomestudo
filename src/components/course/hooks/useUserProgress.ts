
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';

interface CompletedSections {
  [lessonId: string]: string[];
}

interface SubjectsData {
  completed_sections?: CompletedSections;
  [key: string]: any;
}

export function useUserProgress(userId?: string, courseId?: string) {
  const [completedTopics, setCompletedTopics] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !courseId) {
      setLoading(false);
      return;
    }

    const realCourseId = extractIdFromFriendlyUrl(courseId);
    
    async function fetchProgress() {
      setLoading(true);
      
      try {
        // Primeiro, buscar o total de tópicos do curso
        await fetchTotalTopics(realCourseId);
        
        // Depois, buscar o progresso do usuário
        await fetchUserProgress(userId, realCourseId);
      } catch (error) {
        console.error('Erro ao buscar progresso:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // Buscar o total de tópicos do curso
    async function fetchTotalTopics(courseId: string) {
      try {
        // Buscar o curso e suas aulas
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('aulas_ids')
          .eq('id', courseId)
          .single();
          
        if (cursoError) {
          console.error('Erro ao buscar dados do curso:', cursoError);
          return;
        }
        
        if (!cursoData?.aulas_ids?.length) {
          setTotalTopics(0);
          return;
        }
        
        // Buscar todas as aulas para contar os tópicos
        const { data: aulasData, error: aulasError } = await supabase
          .from('aulas')
          .select('topicos_ids')
          .in('id', cursoData.aulas_ids);
          
        if (aulasError) {
          console.error('Erro ao buscar aulas:', aulasError);
          return;
        }
        
        // Contar total de tópicos em todas as aulas
        let totalTopicosCount = 0;
        
        if (aulasData && aulasData.length > 0) {
          aulasData.forEach(aula => {
            if (aula.topicos_ids && Array.isArray(aula.topicos_ids)) {
              totalTopicosCount += aula.topicos_ids.length;
            }
          });
        }
        
        console.log(`Total de tópicos encontrados para o curso ${courseId}: ${totalTopicosCount}`);
        setTotalTopics(totalTopicosCount);
      } catch (error) {
        console.error('Erro ao contar tópicos do curso:', error);
      }
    }

    // Buscar o progresso do usuário
    async function fetchUserProgress(userId: string, courseId: string) {
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('subjects_data')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();
          
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso:', progressError);
          return;
        }
        
        if (!progressData) {
          setCompletedTopics(0);
          setProgressPercentage(0);
          return;
        }
        
        // Calcular tópicos concluídos
        const subjectsData = progressData.subjects_data as SubjectsData;
        
        if (!subjectsData || !subjectsData.completed_sections) {
          setCompletedTopics(0);
          setProgressPercentage(0);
          return;
        }
        
        // Contar tópicos concluídos em todas as aulas
        let completedTopicsCount = 0;
        Object.values(subjectsData.completed_sections).forEach(sections => {
          if (Array.isArray(sections)) {
            completedTopicsCount += sections.length;
          }
        });
        
        setCompletedTopics(completedTopicsCount);
        
        // Calcular percentual
        if (totalTopics > 0) {
          const percentage = Math.round((completedTopicsCount / totalTopics) * 100);
          setProgressPercentage(percentage);
        } else {
          setProgressPercentage(0);
        }
        
        console.log(`Progresso calculado para ${userId} no curso ${courseId}:`, {
          completedTopics: completedTopicsCount,
          totalTopics,
          percentage: Math.round((completedTopicsCount / totalTopics) * 100)
        });
      } catch (error) {
        console.error('Erro ao processar progresso do usuário:', error);
      }
    }

    // Executar a busca inicial
    fetchProgress();

    // Configurar o listener para atualizações de seções
    function handleSectionsUpdated(event: Event) {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.courseId === realCourseId) {
        console.log('Evento sectionsUpdated recebido:', customEvent.detail);
        
        // Atualizar o estado com os novos valores
        const { totalCompleted, totalSections } = customEvent.detail;
        
        if (typeof totalCompleted === 'number') {
          setCompletedTopics(totalCompleted);
        }
        
        if (typeof totalSections === 'number') {
          setTotalTopics(totalSections);
          
          // Recalcular o percentual de progresso
          if (totalSections > 0) {
            const percentage = Math.round((totalCompleted / totalSections) * 100);
            setProgressPercentage(percentage);
          } else {
            setProgressPercentage(0);
          }
        }
      }
    }

    // Adicionar o listener de eventos
    document.addEventListener('sectionsUpdated', handleSectionsUpdated);

    // Configurar intervalo para verificar atualizações de tópicos a cada minuto
    const refreshInterval = setInterval(() => {
      console.log('Verificando atualizações de tópicos...');
      fetchTotalTopics(realCourseId);
    }, 60000); // Verificar a cada minuto

    // Limpar listeners e intervalos na desmontagem
    return () => {
      document.removeEventListener('sectionsUpdated', handleSectionsUpdated);
      clearInterval(refreshInterval);
    };
  }, [userId, courseId]);

  return {
    completedTopics,
    totalTopics,
    progressPercentage,
    loading
  };
}
