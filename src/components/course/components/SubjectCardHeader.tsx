
import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { renderDonutChart } from '../utils/donutChart';

interface SubjectCardHeaderProps {
  subjectName: string;
  aproveitamento: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const SubjectCardHeader: React.FC<SubjectCardHeaderProps> = ({
  subjectName,
  aproveitamento,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="p-3 cursor-pointer" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex items-center justify-center">
            {renderDonutChart(aproveitamento, '#5f2ebe', 'rgba(38,47,60,0.1)')}
            <span className="absolute text-xs font-medium text-[rgba(38,47,60,1)]">{aproveitamento}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-[rgba(38,47,60,1)]">{subjectName}</span>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            onClick={onToggle}
            className="text-[rgba(38,47,60,0.6)] hover:text-[#5f2ebe] transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
