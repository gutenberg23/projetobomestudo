
import React from 'react';
import { LessonCard } from "../../new/LessonCard";
import { Lesson } from '../types/subjects';

interface SubjectLessonsProps {
  lessons: Lesson[];
}

export const SubjectLessons: React.FC<SubjectLessonsProps> = ({ lessons }) => {
  return (
    <div className="px-4 pb-8 md:px-[15px] bg-slate-50 py-[30px] border-l-2 border-r-2 border-[#fff] rounded-xl mb-1">
      {lessons.map(lesson => (
        <LessonCard 
          key={lesson.id} 
          lesson={{
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            sections: lesson.sections.map(section => ({
              id: section.id,
              title: section.title,
              contentType: section.contentType || "video",
              duration: section.duration,
              videoUrl: section.videoUrl,
              textContent: section.textContent
            }))
          }} 
          question={lesson.question} 
        />
      ))}
    </div>
  );
};
