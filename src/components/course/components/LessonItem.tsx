import React from 'react';
import { CheckIcon, XIcon } from "lucide-react";

interface LessonItemProps {
  title: string;
  isCompleted?: boolean;
  stats?: {
    total: number;
    hits: number;
    errors: number;
  };
  questoesIds?: string[];
}

export const LessonItem: React.FC<LessonItemProps> = ({
  title,
  isCompleted = false,
  stats = { total: 0, hits: 0, errors: 0 },
  questoesIds = []
}) => {
  const aproveitamento = stats.total > 0 
    ? Math.round((stats.hits / stats.total) * 100) 
    : 0;

  return (
    <div className="bg-gray-50 rounded-md p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}>
            {isCompleted && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-blue-600">Aprov. (%)</div>
          <div className="font-semibold text-blue-600">{aproveitamento}%</div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-green-600">Acertos</div>
          <div className="font-semibold text-green-600">{stats.hits}</div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-red-600">Erros</div>
          <div className="font-semibold text-red-600">{stats.errors}</div>
        </div>
      </div>
    </div>
  );
};
