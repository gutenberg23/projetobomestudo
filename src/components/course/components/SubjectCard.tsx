
import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { renderDonutChart } from '../utils/donutChart';

interface SubjectCardProps {
  subject: {
    name: string;
    progress: number;
    questionsTotal: number;
    questionsCorrect: number;
    questionsWrong: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  return <div className="bg-[rgba(246,248,250,1)] rounded-[10px]">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="checkbox"
              className="subject-checkbox w-5 h-5 rounded cursor-pointer border-gray-200 text-[#F11CE3] focus:ring-[#F11CE3]"
              onChange={() => null} // Será gerenciado pelo ProgressPanel
            />
            <span className="font-medium text-[rgba(38,47,60,1)]">{subject.name}</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-white p-2 rounded">
              <div className="text-gray-600">Total</div>
              <div className="font-semibold">{subject.questionsTotal}</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-green-600">Acertos</div>
              <div className="font-semibold text-green-600">{subject.questionsCorrect}</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-red-600">Erros</div>
              <div className="font-semibold text-red-600">{subject.questionsWrong}</div>
            </div>
          </div>
        </div>}
    </div>;
};
