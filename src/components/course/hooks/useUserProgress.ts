import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';

// Definindo a interface para a estrutura de dados subjects_data
interface CompletedSections {
  [lessonId: string]: string[];
}

interface SubjectsData {
  completed_sections?: CompletedSections;
  [key: string]: any;
}

interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  subjects_data: SubjectsData;
  performance_goal?: number;
  exam_date?: string;
  created_at: string;
  updated_at: string;
}

interface ProgressStats {
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  loading: boolean;
}

export const useUserProgress = (userId: string | undefined, courseId: string | undefined) => {
  const [stats, setStats] = useState<ProgressStats>({
    totalTopics: 0,
    completedTopics: 0,
    progressPercentage: 0,
    loading: true
  });

  // Função para garantir que estamos usando números válidos para os cálculos
  const ensureValidNumber = (value: any): number => {
    // Se o valor for undefined, null ou NaN, retornar 0
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return !isNaN(num) ? num : 0;
  };

  // Função para obter o total de seções concluídas para todas as aulas
  const getTotalCompletedSections = (subjectsData: SubjectsData, lessonIds: string[]): number => {
    if (!subjectsData.completed_sections) return 0;
    
    let total = 0;
    
    // Percorrer todas as aulas com seções concluídas
    Object.entries(subjectsData.completed_sections).forEach(([lessonId, sectionIds]) => {
      // Verificar se a aula pertence ao curso/disciplina atual
      if (lessonIds.includes(lessonId) && Array.isArray(sectionIds)) {
        total += sectionIds.length;
      }
    });
    
    return total;
  };

  // Função para carregar o progresso do usuário no curso
  const loadUserProgress = async () => {
    if (!userId || !courseId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      const realCourseId = extractIdFromFriendlyUrl(courseId);
      console.log('Buscando progresso para curso/disciplina:', realCourseId);
      
      const { data: progress, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', realCourseId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso:', error);
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }
      
      let totalCompleted = 0;
      let totalTopics = 0;
      
      // Verificar se temos dados de progresso do usuário
      if (progress?.subjects_data) {
        const subjectsData = progress.subjects_data as SubjectsData;
        console.log('Dados de progresso encontrados:', subjectsData);
        
        // Primeiro tentar buscar como disciplina
        const { data: disciplinaData, error: disciplinaError } = await supabase
          .from('disciplinas')
          .select('aulas_ids')
          .eq('id', realCourseId)
          .single();
          
        if (!disciplinaError && disciplinaData) {
          console.log('Dados da disciplina encontrados:', disciplinaData);
          
          // Array para armazenar todos os IDs de aulas
          let todasAulasIds: string[] = [];
          
          // Adicionar aulas da disciplina
          if (disciplinaData?.aulas_ids && Array.isArray(disciplinaData.aulas_ids)) {
            todasAulasIds = [...disciplinaData.aulas_ids];
          }
          
          if (todasAulasIds.length > 0) {
            // Buscar todas as aulas para contar seus tópicos
            const { data: aulasData, error: aulasError } = await supabase
              .from('aulas')
              .select('topicos_ids')
              .in('id', todasAulasIds);
              
            if (aulasError) {
              console.error('Erro ao buscar detalhes das aulas:', aulasError);
            } else {
              console.log('Dados das aulas encontrados:', aulasData);
              
              // Contar o total de tópicos em todas as aulas
              if (aulasData && Array.isArray(aulasData)) {
                // Usar um Set para evitar duplicatas de tópicos
                const topicosUnicos = new Set<string>();
                
                aulasData.forEach(aula => {
                  if (aula.topicos_ids && Array.isArray(aula.topicos_ids)) {
                    aula.topicos_ids.forEach(topicoId => {
                      if (topicoId && topicoId.trim() !== '') {
                        topicosUnicos.add(topicoId);
                      }
                    });
                  }
                });
                
                totalTopics = topicosUnicos.size;
                console.log('Total de tópicos únicos encontrados na disciplina:', totalTopics);
                
                // Contar tópicos concluídos apenas das aulas da disciplina atual
                if (typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
                  totalCompleted = getTotalCompletedSections(subjectsData, todasAulasIds);
                  console.log('Total de tópicos completados na disciplina:', totalCompleted);
                }
              }
            }
          }
        } else {
          // Se não encontrou como disciplina, buscar como curso
          const { data: cursoData, error: cursoError } = await supabase
            .from('cursos')
            .select('disciplinas_ids, aulas_ids')
            .eq('id', realCourseId)
            .single();
            
          if (cursoError) {
            console.error('Erro ao buscar aulas do curso:', cursoError);
          } else {
            console.log('Dados do curso encontrados:', cursoData);
            
            // Array para armazenar todos os IDs de aulas
            let todasAulasIds: string[] = [];
            
            // Adicionar aulas diretamente associadas ao curso
            if (cursoData?.aulas_ids && Array.isArray(cursoData.aulas_ids)) {
              todasAulasIds = [...cursoData.aulas_ids];
            }
            
            // Buscar aulas das disciplinas
            if (cursoData?.disciplinas_ids && Array.isArray(cursoData.disciplinas_ids)) {
              // Buscar todas as disciplinas de uma vez
              const { data: disciplinasData, error: disciplinasError } = await supabase
                .from('disciplinas')
                .select('aulas_ids')
                .in('id', cursoData.disciplinas_ids);
                
              if (!disciplinasError && disciplinasData) {
                // Adicionar aulas de cada disciplina
                disciplinasData.forEach(disciplina => {
                  if (disciplina.aulas_ids && Array.isArray(disciplina.aulas_ids)) {
                    todasAulasIds = [...todasAulasIds, ...disciplina.aulas_ids];
                  }
                });
              }
            }
            
            // Remover duplicatas de IDs de aulas
            todasAulasIds = Array.from(new Set(todasAulasIds));
            console.log('Total de aulas encontradas:', todasAulasIds.length);
            
            if (todasAulasIds.length > 0) {
              // Buscar todas as aulas para contar seus tópicos
              const { data: aulasData, error: aulasError } = await supabase
                .from('aulas')
                .select('topicos_ids')
                .in('id', todasAulasIds);
                
              if (aulasError) {
                console.error('Erro ao buscar detalhes das aulas:', aulasError);
              } else {
                console.log('Dados das aulas encontrados:', aulasData);
                
                // Contar o total de tópicos em todas as aulas
                if (aulasData && Array.isArray(aulasData)) {
                  // Usar um Set para evitar duplicatas de tópicos
                  const topicosUnicos = new Set<string>();
                  
                  aulasData.forEach(aula => {
                    if (aula.topicos_ids && Array.isArray(aula.topicos_ids)) {
                      aula.topicos_ids.forEach(topicoId => {
                        if (topicoId && topicoId.trim() !== '') {
                          topicosUnicos.add(topicoId);
                        }
                      });
                    }
                  });
                  
                  totalTopics = topicosUnicos.size;
                  console.log('Total de tópicos únicos encontrados no curso:', totalTopics);
                  
                  // Contar tópicos concluídos apenas das aulas do curso atual
                  if (typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
                    totalCompleted = getTotalCompletedSections(subjectsData, todasAulasIds);
                    console.log('Total de tópicos completados no curso:', totalCompleted);
                  }
                }
              }
            }
          }
        }
      }
      
      // Calcular percentual de progresso
      const progressPercentage = totalTopics > 0
        ? Math.round((totalCompleted / totalTopics) * 100)
        : 0;
      
      setStats({
        totalTopics,
        completedTopics: totalCompleted,
        progressPercentage,
        loading: false
      });
      
      console.log('Estatísticas de progresso finais:', {
        totalTopics,
        completedTopics: totalCompleted,
        progressPercentage
      });
    } catch (error) {
      console.error('Erro ao processar progresso:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Atualizar o progresso quando o usuário ou curso mudar
  useEffect(() => {
    loadUserProgress();
    
    // Escutar eventos de atualização de seções
    const handleSectionsUpdated = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) {
        console.log("Evento sectionsUpdated recebido em useUserProgress:", detail);
        
        if (detail.totalCompleted !== undefined && detail.totalSections !== undefined) {
          // Garantir que os valores são números
          const totalCompleted = ensureValidNumber(detail.totalCompleted);
          const totalSections = ensureValidNumber(detail.totalSections);
          
          // Calcular percentual de progresso
          const progressPercentage = totalSections > 0
            ? Math.round((totalCompleted / totalSections) * 100)
            : 0;
          
          setStats({
            totalTopics: totalSections,
            completedTopics: totalCompleted,
            progressPercentage,
            loading: false
          });
          
          console.log(`Progresso atualizado em useUserProgress: ${totalCompleted}/${totalSections} (${progressPercentage}%)`);
        }
      }
    };
    
    document.addEventListener('sectionsUpdated', handleSectionsUpdated);
    
    return () => {
      document.removeEventListener('sectionsUpdated', handleSectionsUpdated);
    };
  }, [userId, courseId]);

  return {
    ...stats,
    reloadProgress: loadUserProgress
  };
};
