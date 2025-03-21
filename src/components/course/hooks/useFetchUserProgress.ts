
import { supabase } from '@/integrations/supabase/client';
import { SubjectProgressData } from '../types/lessonTypes';

export const useFetchUserProgress = () => {
  const fetchUserProgress = async (userId: string, courseId: string, subjectId: string): Promise<SubjectProgressData | null> => {
    if (!userId) return null;
    
    try {
      const { data: userProgressRaw, error: progressError } = await supabase
        .from('user_course_progress')
        .select('subjects_data')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (!userProgressRaw?.subjects_data || progressError) {
        return null;
      }

      let subjectsData: Record<string, SubjectProgressData> = {};
      
      // Verificar se subjects_data é uma string JSON e fazer parse se necessário
      if (typeof userProgressRaw.subjects_data === 'string') {
        try {
          subjectsData = JSON.parse(userProgressRaw.subjects_data);
        } catch (e) {
          console.error('Erro ao fazer parse do subjects_data:', e);
          return null;
        }
      } else if (typeof userProgressRaw.subjects_data === 'object') {
        // Se já é um objeto, usamos diretamente
        subjectsData = userProgressRaw.subjects_data as Record<string, SubjectProgressData>;
      }

      return subjectsData[subjectId] || null;
    } catch (error) {
      console.error('Erro ao buscar progresso do usuário:', error);
      return null;
    }
  };

  return { fetchUserProgress };
};
