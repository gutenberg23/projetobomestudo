
import React from 'react';
import { LessonCard } from "../../new/LessonCard";
import { Lesson, Section } from '../types/subjects';

interface SubjectLessonsProps {
  lessons: Lesson[];
}

export const SubjectLessons: React.FC<SubjectLessonsProps> = ({ lessons }) => {
  return (
    <div className="px-4 pb-8 md:px-[15px] bg-slate-50 py-[30px] border-l-2 border-r-2 border-[#fff] rounded-xl mb-1">
      {lessons.map(lesson => {
        // Processamos as seções para garantir que contentType seja um dos valores permitidos
        const processedSections = lesson.sections?.map(section => ({
          ...section,
          // Garantir que contentType seja um dos valores permitidos
          contentType: section.contentType === "video" || section.contentType === "text" || section.contentType === "quiz" 
            ? section.contentType 
            : "text" as const, // fallback para "text" se o valor não for um dos permitidos
          // Garantir que duration seja um número
          duration: typeof section.duration === 'number' 
            ? section.duration 
            : parseInt(String(section.duration)) || 0
        })) || [];

        return (
          <LessonCard 
            key={lesson.id} 
            lesson={{
              id: lesson.id,
              title: lesson.title,
              description: lesson.description || '',
              sections: processedSections,
              question: lesson.question,
              // Convertemos a duration de string para número
              duration: typeof lesson.duration === 'number' 
                ? lesson.duration 
                : typeof lesson.duration === 'string' 
                  ? parseInt(lesson.duration) || 0 
                  : 0,
            }} 
          />
        );
      })}
    </div>
  );
};
