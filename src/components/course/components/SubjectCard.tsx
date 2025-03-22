
import React, { useEffect } from 'react';
import { useSubjectLessons } from '../hooks/useSubjectLessons';
import { useSubjectStats } from '../hooks/useSubjectStats';
import { SubjectCardHeader } from './SubjectCardHeader';
import { SubjectStatistics } from './SubjectStatistics';
import { SubjectLessonsList } from './SubjectLessonsList';
import { SubjectCardProps } from '../types/subjectCard';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  const subjectId = String(subject.id);
  const courseId = String(subject.courseId || 'default');
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  
  const { lessons, loading } = useSubjectLessons({ 
    subjectId, 
    courseId 
  });
  
  const { getSubjectStats } = useSubjectStats(subject, lessons);
  const stats = getSubjectStats();

  useEffect(() => {
    // Ao expandir o card, verificar e atualizar as estatísticas
    if (isExpanded && user && courseIdParam) {
      const updateStats = async () => {
        try {
          const realCourseId = extractIdFromFriendlyUrl(courseIdParam);
          
          // Verificar progresso salvo
          const { data: progressData, error } = await supabase
            .from('user_course_progress')
            .select('subjects_data')
            .eq('user_id', user.id)
            .eq('course_id', realCourseId)
            .maybeSingle();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Erro ao carregar progresso do usuário:', error);
          }
          
          // Se há dados de progresso, verificar dados do assunto
          if (progressData?.subjects_data) {
            console.log('Dados de progresso encontrados:', progressData.subjects_data);
            
            // Disparar evento para atualização
            window.dispatchEvent(new CustomEvent('topicCompleted'));
          }
        } catch (error) {
          console.error('Erro ao verificar progresso:', error);
        }
      };
      
      updateStats();
    }
  }, [isExpanded, user, courseIdParam, subjectId]);
  
  const subjectName = subject.name || subject.titulo || '';
  
  return (
    <div className="bg-[rgba(246,248,250,1)] rounded-[10px]">
      <SubjectCardHeader 
        subjectName={subjectName}
        aproveitamento={stats.aproveitamento}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
      
      {isExpanded && (
        <div className="px-3 pb-3">
          <SubjectStatistics 
            aproveitamento={stats.aproveitamento}
            questionsCorrect={stats.questionsCorrect}
            questionsWrong={stats.questionsWrong}
          />
          
          <SubjectLessonsList 
            lessons={lessons}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};
