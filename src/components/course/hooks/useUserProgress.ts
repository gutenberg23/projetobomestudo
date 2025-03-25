
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
  const getTotalCompletedSections = (subjectsData: SubjectsData): number => {
    if (!subjectsData.completed_sections) return 0;
    
    let total = 0;
    
    // Percorrer todas as aulas com seções concluídas
    Object.values(subjectsData.completed_sections).forEach(sectionIds => {
      // Verificar se sectionIds é um array antes de usar o length
      if (Array.isArray(sectionIds)) {
        total += sectionIds.length;
      }
    });
    
    return total;
  };

  // Função para calcular o total de tópicos em um curso, buscando informações atualizadas do banco
  const calculateTotalTopics = async (realCourseId: string): Promise<number> => {
    try {
      // Buscar o curso para obter as aulas atualizadas
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('aulas_ids')
        .eq('id', realCourseId)
        .single();
        
      if (cursoError) {
        console.error('Erro ao buscar aulas do curso:', cursoError);
        return 0;
      }

      if (!cursoData?.aulas_ids || !Array.isArray(cursoData.aulas_ids) || cursoData.aulas_ids.length === 0) {
        return 0;
      }

      // Buscar todas as aulas do curso para contar seus tópicos
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('topicos_ids')
        .in('id', cursoData.aulas_ids);
        
      if (aulasError) {
        console.error('Erro ao buscar detalhes das aulas:', aulasError);
        return 0;
      }
      
      // Contar o total de tópicos em todas as aulas
      let totalTopics = 0;
      if (aulasData && Array.isArray(aulasData)) {
        totalTopics = aulasData.reduce((sum, aula) => {
          return sum + (Array.isArray(aula.topicos_ids) ? aula.topicos_ids.length : 0);
        }, 0);
        
        console.log('Total de tópicos encontrados (cálculo dinâmico):', totalTopics);
      }
      
      return totalTopics;
    } catch (error) {
      console.error('Erro ao calcular o total de tópicos:', error);
      return 0;
    }
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
      
      // Buscar o progresso do usuário
      const { data: progress, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', realCourseId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso do curso:', error);
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }
      
      // Calcular tópicos concluídos
      let totalCompleted = 0;
      
      // Verificar se temos dados de progresso do usuário
      if (progress?.subjects_data) {
        const subjectsData = progress.subjects_data as SubjectsData;
        
        // Contar tópicos concluídos
        if (typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
          totalCompleted = getTotalCompletedSections(subjectsData);
        }
      }
      
      // Obter o total de tópicos diretamente do banco de dados (sempre atualizado)
      const totalTopics = await calculateTotalTopics(realCourseId);
      
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
      
      console.log('Estatísticas de progresso atualizadas:', {
        totalTopics,
        completedTopics: totalCompleted,
        progressPercentage
      });
    } catch (error) {
      console.error('Erro ao processar progresso do curso:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Configurar listeners para atualizações de curso, aulas e tópicos
  const setupDatabaseListeners = (realCourseId: string) => {
    // Canal para escutar atualizações no curso, aulas ou tópicos
    const channel = supabase
      .channel('course-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'cursos',
        filter: `id=eq.${realCourseId}`
      }, () => {
        console.log('Curso atualizado, recarregando progresso...');
        loadUserProgress();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'aulas'
      }, () => {
        console.log('Aula atualizada, recarregando progresso...');
        loadUserProgress();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'aulas'
      }, () => {
        console.log('Nova aula adicionada, recarregando progresso...');
        loadUserProgress();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Atualizar o progresso quando o usuário ou curso mudar
  useEffect(() => {
    loadUserProgress();
    
    // Configurar listeners somente se tivermos courseId
    if (courseId) {
      const realCourseId = extractIdFromFriendlyUrl(courseId);
      const cleanup = setupDatabaseListeners(realCourseId);
      
      return cleanup;
    }
    
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
