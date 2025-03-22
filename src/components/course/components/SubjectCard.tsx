
import React from 'react';
import { useSubjectLessons } from '../hooks/useSubjectLessons';
import { useSubjectStats } from '../hooks/useSubjectStats';
import { SubjectCardHeader } from './SubjectCardHeader';
import { SubjectStatistics } from './SubjectStatistics';
import { SubjectLessonsList } from './SubjectLessonsList';
import { SubjectCardProps } from '../types/subjectCard';

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  const subjectId = String(subject.id);
  const courseId = String(subject.courseId || 'default');
  
  const { lessons, loading } = useSubjectLessons({ 
    subjectId, 
    courseId 
  });
  
  const { getSubjectStats } = useSubjectStats(subject, lessons);
  const stats = getSubjectStats();
  
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
