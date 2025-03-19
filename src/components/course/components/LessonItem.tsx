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
  onToggleComplete?: () => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({
  title,
  isCompleted = false,
  stats = { total: 0, hits: 0, errors: 0 },
  questoesIds = [],
  onToggleComplete
}) => {
  const aproveitamento = stats.total > 0 
    ? Math.round((stats.hits / stats.total) * 100) 
    : 0;

  return (
    <div className="bg-gray-50 rounded-md p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-4 rounded-full flex items-center justify-center cursor-pointer ${isCompleted ? 'bg-[#5f2ebe]' : 'bg-[rgba(38,47,60,0.2)]'}`}
            onClick={onToggleComplete}
          >
            {isCompleted && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
          <span className="font-medium text-sm text-[rgba(38,47,60,1)]">{title}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-[#5f2ebe]">Aprov. (%)</div>
          <div className="font-semibold text-[#5f2ebe]">{aproveitamento}%</div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-[#5f2ebe]">Acertos</div>
          <div className="font-semibold text-[#5f2ebe]">{stats.hits}</div>
        </div>
        <div className="bg-white p-1.5 rounded text-center">
          <div className="text-[#ffac33]">Erros</div>
          <div className="font-semibold text-[#ffac33]">{stats.errors}</div>
        </div>
      </div>
    </div>
  );
};
