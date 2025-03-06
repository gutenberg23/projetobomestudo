
import React from "react";
import { Link } from "react-router-dom";

interface SubjectCardProps {
  title: string;
  description: string;
  lessonsCount: number;
  progress: number;
  courseId?: string;
  subjectId: string;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  title,
  description,
  lessonsCount,
  progress,
  courseId,
  subjectId
}) => {
  return (
    <Link to={`/course/${courseId}/subject/${subjectId}`} className="block">
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-[#272f3c] font-bold text-xl mb-2">{title}</h3>
        <p className="text-[#67748a] mb-4 text-sm line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#67748a]">{lessonsCount} aulas</span>
          <span className="text-xs font-medium text-[#5f2ebe]">{progress}% concluído</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#5f2ebe] h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );
};
