
import React, { useEffect, useState } from 'react';
import { LessonCard } from "../../new/LessonCard";
import { Lesson } from '../types/subjects';

interface SubjectLessonsProps {
  lessons: Lesson[];
}

export const SubjectLessons: React.FC<SubjectLessonsProps> = ({ lessons }) => {
  const [progress, setProgress] = useState({
    completedSections: 0,
    totalSections: lessons.reduce((acc, lesson) => acc + lesson.sections.length, 0),
    answeredQuestions: 0,
    correctAnswers: 0
  });

  const handleProgressUpdate = (completed: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      completedSections: completed,
    }));
  };

  const handleQuestionsUpdate = (answered: number, correct: number) => {
    setProgress(prev => ({
      ...prev,
      answeredQuestions: answered,
      correctAnswers: correct
    }));
  };

  useEffect(() => {
    const subjectId = lessons[0]?.id || Math.random().toString();
    
    // Disparamos o evento somente quando houver mudanças reais nos valores
    const event = new CustomEvent('progressUpdate', {
      detail: {
        subjectId,
        completedSections: progress.completedSections,
        totalSections: progress.totalSections,
        answeredQuestions: progress.answeredQuestions,
        correctAnswers: progress.correctAnswers
      }
    });
    window.dispatchEvent(event);

    // Limpeza ao desmontar
    return () => {
      // Só limpamos se o componente realmente for desmontado, não quando esconder
      if (!document.body.contains(document.querySelector(`[data-subject-id="${subjectId}"]`))) {
        const cleanupEvent = new CustomEvent('progressCleanup', {
          detail: { subjectId }
        });
        window.dispatchEvent(cleanupEvent);
      }
    };
  }, [lessons, progress.completedSections, progress.answeredQuestions, progress.correctAnswers]);

  return (
    <div data-subject-id={lessons[0]?.id} className="px-4 pb-8 md:px-[15px] bg-slate-50 py-[30px] border-l-2 border-r-2 border-[#fff] rounded-xl mb-1">
      {lessons.map(lesson => (
        <LessonCard 
          key={lesson.id} 
          lesson={{
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            rating: lesson.rating,
            sections: lesson.sections
          }} 
          question={lesson.question}
          onProgressUpdate={handleProgressUpdate}
          onQuestionsUpdate={handleQuestionsUpdate}
        />
      ))}
    </div>
  );
};

