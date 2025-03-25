
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

  // Função para contar o total de tópicos no curso de forma dinâmica
  const countTotalTopicsInCourse = async (realCourseId: string): Promise<number> => {
    try {
      // Buscar todas as aulas do curso
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('aulas_ids, topicos_ids')
        .eq('id', realCourseId)
        .single();
        
      if (cursoError || !cursoData) {
        console.error('Erro ao buscar aulas do curso:', cursoError);
        return 0;
      }
      
      let totalTopics = 0;
      
      // Se o curso tiver topicos_ids diretamente, contar eles primeiro
      if (cursoData.topicos_ids && Array.isArray(cursoData.topicos_ids)) {
        totalTopics += cursoData.topicos_ids.length;
        console.log(`Curso tem ${cursoData.topicos_ids.length} tópicos diretos`);
      }
      
      // Se não houver aulas, retornar apenas a contagem de tópicos diretos
      if (!cursoData.aulas_ids || !cursoData.aulas_ids.length) {
        console.log(`Total final: ${totalTopics} tópicos (apenas diretos do curso)`);
        return totalTopics;
      }
      
      // Buscar todas as aulas para contar seus tópicos
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('topicos_ids')
        .in('id', cursoData.aulas_ids);
        
      if (aulasError || !aulasData) {
        console.error('Erro ao buscar detalhes das aulas:', aulasError);
        return totalTopics; // Retornar ao menos os tópicos diretos
      }
      
      // Contar o total de tópicos em todas as aulas
      aulasData.forEach(aula => {
        if (Array.isArray(aula.topicos_ids)) {
          totalTopics += aula.topicos_ids.length;
          console.log(`Aula com ${aula.topicos_ids.length} tópicos`);
        }
      });
      
      console.log(`Total final: ${totalTopics} tópicos encontrados no curso ${realCourseId}`);
      return totalTopics;
    } catch (error) {
      console.error('Erro ao contar tópicos do curso:', error);
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
      console.log('Buscando progresso para curso:', realCourseId);
      
      // Buscar o progresso do usuário no curso
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
      
      // Contar o total de tópicos concluídos
      let totalCompleted = 0;
      
      // Verificar se temos dados de progresso do usuário
      if (progress?.subjects_data) {
        const subjectsData = progress.subjects_data as SubjectsData;
        
        if (typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
          totalCompleted = getTotalCompletedSections(subjectsData);
        }
      }
      
      // Contar dinamicamente o total de tópicos do curso
      const totalTopics = await countTotalTopicsInCourse(realCourseId);
      
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

  // Atualizar o progresso quando o usuário ou curso mudar
  useEffect(() => {
    loadUserProgress();
    
    // Escutar eventos de atualização de seções
    const handleSectionsUpdated = (event: Event) => {
      console.log("Evento sectionsUpdated recebido em useUserProgress");
      loadUserProgress();
    };
    
    // Escutar também eventos topicCompleted para atualização em tempo real
    const handleTopicCompleted = () => {
      console.log("Evento topicCompleted recebido em useUserProgress");
      loadUserProgress();
    };
    
    document.addEventListener('sectionsUpdated', handleSectionsUpdated);
    document.addEventListener('topicCompleted', handleTopicCompleted);
    
    return () => {
      document.removeEventListener('sectionsUpdated', handleSectionsUpdated);
      document.removeEventListener('topicCompleted', handleTopicCompleted);
    };
  }, [userId, courseId]);

  return {
    ...stats,
    reloadProgress: loadUserProgress
  };
};
