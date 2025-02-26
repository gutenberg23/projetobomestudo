
import React, { useEffect, useState } from 'react';
import { LessonCard } from "../../new/LessonCard";
import { Lesson } from '../types/subjects';

interface SubjectLessonsProps {
  lessons: Lesson[];
}

export const SubjectLessons: React.FC<SubjectLessonsProps> = ({ lessons }) => {
  const [progress, setProgress] = useState({
    completedSections: 0,
    totalSections: 0,
    answeredQuestions: 0,
    correctAnswers: 0
  });

  const handleProgressUpdate = (completed: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      completedSections: completed,
      totalSections: total
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
    // Dispatch event to update ProgressPanel
    const event = new CustomEvent('progressUpdate', {
      detail: {
        completedSections: progress.completedSections,
        totalSections: progress.totalSections,
        answeredQuestions: progress.answeredQuestions,
        correctAnswers: progress.correctAnswers
      }
    });
    window.dispatchEvent(event);
  }, [progress]);

  return (
    <div className="px-4 pb-8 md:px-[15px] bg-slate-50 py-[30px] border-l-2 border-r-2 border-[#fff] rounded-xl mb-1">
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
