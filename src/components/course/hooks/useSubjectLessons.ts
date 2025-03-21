
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcessedLesson, FetchLessonsResult } from '../types/lessonTypes';
import { useFetchLessonsByIds } from './useFetchLessonsByIds';
import { useFetchSubjectInfo } from './useFetchSubjectInfo';
import { useFetchUserProgress } from './useFetchUserProgress';
import { useQuestionsStats } from './useQuestionsStats';

interface UseSubjectLessonsProps {
  subjectId: string;
  courseId?: string;
}

export const useSubjectLessons = ({ subjectId, courseId = 'default' }: UseSubjectLessonsProps): FetchLessonsResult => {
  const [lessons, setLessons] = useState<ProcessedLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const { fetchLessonsByIds, setLoading: setLessonLoading } = useFetchLessonsByIds();
  const { fetchSubjectInfo } = useFetchSubjectInfo();
  const { fetchUserProgress } = useFetchUserProgress();
  const { fetchQuestionsIds, calculateLessonStats } = useQuestionsStats();

  useEffect(() => {
    if (subjectId) {
      fetchLessons();
    }
  }, [subjectId]);

  const fetchLessons = async () => {
    if (!subjectId) return;
    if (lessons.length > 0) return;

    setLoading(true);
    setLessonLoading(true);
    
    try {
      // 1. Buscar IDs de aulas relacionadas à disciplina
      const aulaIds = await fetchSubjectInfo(subjectId);
      
      if (!aulaIds.length) {
        setLessons([]);
        return;
      }
      
      // 2. Buscar detalhes das aulas pelos IDs
      const aulasData = await fetchLessonsByIds(aulaIds);
      
      if (!aulasData.length) {
        setLessons([]);
        return;
      }
      
      // 3. Preparar dados iniciais das aulas
      const processedLessons: ProcessedLesson[] = aulasData.map(aula => ({
        id: aula.id,
        titulo: aula.titulo,
        concluida: false,
        questoesIds: aula.questoes_ids || [],
        stats: {
          total: 0,
          hits: 0,
          errors: 0
        }
      }));
      
      // 4. Adicionar informações de progresso do usuário (se disponível)
      if (user?.id) {
        // 4.1 Buscar progresso do usuário
        const subjectProgress = await fetchUserProgress(user.id, courseId, subjectId);
        
        // 4.2 Atualizar dados de conclusão das aulas
        if (subjectProgress?.lessons) {
          for (const lesson of processedLessons) {
            if (subjectProgress.lessons[lesson.id]?.completed) {
              lesson.concluida = true;
            }
          }
        }
        
        // 4.3 Processar estatísticas de questões para cada aula
        for (const lesson of processedLessons) {
          // Se já tem questões IDs no objeto da aula, usar esses
          let questoesIds = lesson.questoesIds;
          
          // Se não tem, buscar da tabela de questões
          if (!questoesIds.length) {
            questoesIds = await fetchQuestionsIds(lesson.id);
            lesson.questoesIds = questoesIds;
          }
          
          // Calcular estatísticas para as questões
          if (questoesIds.length > 0) {
            lesson.stats = await calculateLessonStats(questoesIds, user.id);
          }
        }
      }
      
      setLessons(processedLessons);
    } catch (error) {
      console.error('Erro ao processar dados das aulas:', error);
      setLessons([]);
    } finally {
      setLoading(false);
      setLessonLoading(false);
    }
  };

  return { lessons, loading };
};
