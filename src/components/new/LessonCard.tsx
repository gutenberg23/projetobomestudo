
import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    sections: {
      id: string;
      title: string;
      contentType: "video";
      videoUrl: string;
    }[];
  };
  question?: {
    id: string;
    year: string;
    institution: string;
    organization: string;
    role: string;
    content: string;
    options: { 
      id: string; 
      text: string; 
      isCorrect: boolean 
    }[];
    comments: any[];
  };
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, question }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-[#272f3c]">{lesson.title}</h3>
        <p className="text-[#67748a] mb-4">{lesson.description}</p>
        <div className="flex flex-wrap gap-2">
          {lesson.sections.map((section) => (
            <Link
              key={section.id}
              to={`/lesson/${lesson.id}/section/${section.id}`}
              className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              <Play className="w-4 h-4 mr-1" />
              {section.title}
            </Link>
          ))}
        </div>
      </div>
      {question && (
        <div className="mt-2 p-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Questão relacionada
            </span>
            <Link
              to={`/question/${question.id}`}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Ver questão
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
