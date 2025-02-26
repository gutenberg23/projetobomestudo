
import React from 'react';

interface ProgressSummaryProps {
  totalCompletedSections: number;
  totalSections: number;
  progressPercentage: number;
  totalQuestions: number;
  totalCorrectAnswers: number;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  totalCompletedSections,
  totalSections,
  progressPercentage,
  totalQuestions,
  totalCorrectAnswers,
}) => {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 px-5 py-4 rounded-[10px]">
          <span className="text-xl text-[rgba(241,28,227,1)]">
            <div className="bg-white border min-h-[42px] w-14 flex items-center justify-center px-2.5 py-[9px] rounded-[10px] border-[rgba(241,28,227,1)] text-center">
              {progressPercentage}%
            </div>
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Aulas assistidas: {totalCompletedSections}/{totalSections}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-[rgba(241,28,227,1)] rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-2">Questões respondidas</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">{totalQuestions}</div>
            <div className="text-sm text-gray-600">questões totais</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Questões corretas</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">{totalCorrectAnswers}</div>
            <div className="text-sm text-gray-600">questões corretas</div>
          </div>
        </div>
      </div>
    </>
  );
};
