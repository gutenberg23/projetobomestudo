import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { renderDonutChart } from '../utils/donutChart';
import { calculateSubjectTotals } from '../utils/statsCalculations';

interface SubjectCardProps {
  subject: any; 
  isExpanded: boolean;
  onToggle: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  const getSubjectStats = () => {
    if (subject.progress !== undefined && 
        subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      return {
        progress: subject.progress,
        questionsTotal: subject.questionsTotal,
        questionsCorrect: subject.questionsCorrect,
        questionsWrong: subject.questionsWrong
      };
    }
    
    if (subject.topics) {
      const stats = calculateSubjectTotals(subject.topics);
      return {
        progress: stats.totalTopics > 0 
          ? Math.round((stats.completedTopics / stats.totalTopics) * 100) 
          : 0,
        questionsTotal: stats.exercisesDone,
        questionsCorrect: stats.hits,
        questionsWrong: stats.errors
      };
    }
    
    if (subject.stats) {
      return {
        progress: subject.stats.totalTopics > 0 
          ? Math.round((subject.stats.completedTopics / subject.stats.totalTopics) * 100) 
          : 0,
        questionsTotal: subject.stats.exercisesDone || 0,
        questionsCorrect: subject.stats.hits || 0,
        questionsWrong: subject.stats.errors || 0
      };
    }
    
    return {
      progress: 0,
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0
    };
  };
  
  const stats = getSubjectStats();
  
  return <div className="bg-[rgba(246,248,250,1)] rounded-[10px]">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex items-center justify-center">
              {renderDonutChart(stats.progress)}
              <span className="absolute text-xs font-medium">{stats.progress}%</span>
            </div>
            <span className="font-medium text-[rgba(38,47,60,1)]">{subject.name || subject.titulo}</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-white p-2 rounded">
              <div className="text-gray-600">Total</div>
              <div className="font-semibold">{stats.questionsTotal}</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-green-600">Acertos</div>
              <div className="font-semibold text-green-600">{stats.questionsCorrect}</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-red-600">Erros</div>
              <div className="font-semibold text-red-600">{stats.questionsWrong}</div>
            </div>
          </div>
        </div>}
    </div>;
};
