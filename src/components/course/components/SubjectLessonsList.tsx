import React from 'react';
import { LessonItem } from './LessonItem';
import { LessonData } from '../types/subjectCard';

interface SubjectLessonsListProps {
  lessons: LessonData[];
  loading: boolean;
  topicoStats: Record<string, { correct: number; wrong: number }>;
}

export const SubjectLessonsList: React.FC<SubjectLessonsListProps> = ({
  lessons,
  loading,
  topicoStats
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
      {lessons.map((lesson) => {
        // Calcular estatísticas dos tópicos desta aula
        let totalHits = 0;
        let totalErrors = 0;
        
        console.log('Calculando estatísticas para aula:', lesson.titulo);
        console.log('Tópicos da aula:', lesson.topicosIds);
        console.log('Estatísticas disponíveis:', topicoStats);
        
        if (lesson.topicosIds) {
          lesson.topicosIds.forEach(topicoId => {
            const stats = topicoStats[topicoId];
            console.log('Estatísticas do tópico', topicoId, ':', stats);
            if (stats) {
              totalHits += stats.correct;
              totalErrors += stats.wrong;
            }
          });
        }
        
        console.log('Totais calculados:', {
          aula: lesson.titulo,
          hits: totalHits,
          errors: totalErrors
        });
        
        return (
          <LessonItem 
            key={lesson.id}
            title={lesson.titulo}
            isCompleted={lesson.concluida}
            stats={{
              total: totalHits + totalErrors,
              hits: totalHits,
              errors: totalErrors
            }}
            questoesIds={lesson.questoesIds}
          />
        );
      })}
    </div>
  );
};
