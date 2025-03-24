
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';

interface UserProgressResult {
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  loading: boolean;
}

export const useUserProgress = (userId?: string, courseId?: string): UserProgressResult => {
  const [totalTopics, setTotalTopics] = useState<number>(0);
  const [completedTopics, setCompletedTopics] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProgress = async () => {
      if (!userId || userId === 'guest' || !courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Verificar e renovar sessão antes da busca
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.log("Sessão inválida ou expirada, tentando renovar...");
          await supabase.auth.refreshSession();
        }
        
        const { data: userProgress, error } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', realCourseId)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error("Erro ao buscar progresso:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (userProgress && userProgress.length > 0 && userProgress[0].subjects_data) {
          const data = userProgress[0].subjects_data;
          
          let totalCompletedSections = 0;
          let totalSectionsCount = 0;
          
          // Percorrer os subjects para contar tópicos
          if (Array.isArray(data)) {
            data.forEach(subject => {
              if (subject.topics && Array.isArray(subject.topics)) {
                totalSectionsCount += subject.topics.length;
                // Contar tópicos marcados como concluídos
                subject.topics.forEach(topic => {
                  if (topic.isDone === true) {
                    totalCompletedSections++;
                  }
                });
              }
            });
          }
          
          if (isMounted) {
            setTotalTopics(totalSectionsCount);
            setCompletedTopics(totalCompletedSections);
            
            // Calcular o percentual de progresso
            const percentage = totalSectionsCount > 0 
              ? Math.round((totalCompletedSections / totalSectionsCount) * 100) 
              : 0;
            setProgressPercentage(percentage);
            
            console.log("Progresso calculado:", {
              totalTopics: totalSectionsCount,
              completedTopics: totalCompletedSections,
              progressPercentage: percentage
            });
          }
        } else {
          console.log("Nenhum progresso encontrado ou dados inválidos");
          
          // Buscar dados do curso para determinar total de tópicos
          const { data: courseData, error: courseError } = await supabase
            .from('cursoverticalizado')
            .select('disciplinas_ids')
            .eq('curso_id', realCourseId)
            .single();
            
          if (courseError) {
            console.error("Erro ao buscar dados do curso:", courseError);
          } else if (courseData && courseData.disciplinas_ids && Array.isArray(courseData.disciplinas_ids)) {
            const { data: disciplinas, error: disciplinasError } = await supabase
              .from('disciplinaverticalizada')
              .select('topicos')
              .in('id', courseData.disciplinas_ids);
              
            if (disciplinasError) {
              console.error("Erro ao buscar disciplinas:", disciplinasError);
            } else if (disciplinas) {
              let totalTopicsCount = 0;
              
              disciplinas.forEach(disciplina => {
                if (disciplina.topicos && Array.isArray(disciplina.topicos)) {
                  totalTopicsCount += disciplina.topicos.length;
                }
              });
              
              if (isMounted) {
                setTotalTopics(totalTopicsCount);
                setCompletedTopics(0);
                setProgressPercentage(0);
                
                console.log("Total de tópicos calculado do curso:", totalTopicsCount);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar progresso do usuário:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProgress();
    
    // Adicionar listener para atualizar quando os tópicos são marcados/desmarcados
    const handleTopicChange = () => {
      fetchUserProgress();
    };
    
    document.addEventListener('topicCompleted', handleTopicChange);
    document.addEventListener('dataSaved', handleTopicChange);
    
    return () => {
      isMounted = false;
      document.removeEventListener('topicCompleted', handleTopicChange);
      document.removeEventListener('dataSaved', handleTopicChange);
    };
  }, [userId, courseId]);

  return { totalTopics, completedTopics, progressPercentage, loading };
};
