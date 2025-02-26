
import React, { useEffect, useState } from 'react';
import { LessonCard } from "../../new/LessonCard";
import { Lesson } from '../types/subjects';

interface SubjectLessonsProps {
  lessons: Lesson[];
}

export const SubjectLessons: React.FC<SubjectLessonsProps> = ({ lessons }) => {
  const [totalCompletedSections, setTotalCompletedSections] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleProgressUpdate = (completed: number, total: number) => {
    setTotalCompletedSections(prev => prev + completed);
    setTotalSections(prev => prev + total);
  };

  const handleQuestionsUpdate = (answered: number, correct: number) => {
    setAnsweredQuestions(answered);
    setCorrectAnswers(correct);
  };

  useEffect(() => {
    // Dispatch event to update ProgressPanel
    const event = new CustomEvent('progressUpdate', {
      detail: {
        completedSections: totalCompletedSections,
        totalSections,
        answeredQuestions,
        correctAnswers
      }
    });
    window.dispatchEvent(event);
  }, [totalCompletedSections, totalSections, answeredQuestions, correctAnswers]);

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
