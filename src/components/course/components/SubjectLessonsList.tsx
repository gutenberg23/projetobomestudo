
import React from 'react';
import { LessonItem } from './LessonItem';
import { LessonData } from '../types/subjectCard';

interface SubjectLessonsListProps {
  lessons: LessonData[];
  loading: boolean;
}

export const SubjectLessonsList: React.FC<SubjectLessonsListProps> = ({
  lessons,
  loading
}) => {
  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#5f2ebe] border-r-transparent"></div>
        <div className="mt-1 text-xs text-[rgba(38,47,60,1)]">Carregando aulas...</div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-3 text-[rgba(38,47,60,0.6)]">
        Nenhuma aula encontrada para esta disciplina.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson) => (
        <LessonItem 
          key={lesson.id}
          title={lesson.titulo}
          isCompleted={lesson.concluida}
          stats={{
            total: lesson.stats.total,
            hits: lesson.stats.hits,
            errors: lesson.stats.errors
          }}
          questoesIds={lesson.questoesIds}
        />
      ))}
    </div>
  );
};
