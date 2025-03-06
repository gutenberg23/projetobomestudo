
import React from 'react';
interface ProgressSummaryProps {
  totalCompletedSections: number;
  totalSections: number;
  progressPercentage: number;
  totalQuestions: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
}
export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  totalCompletedSections,
  totalSections,
  progressPercentage,
  totalQuestions,
  totalCorrectAnswers,
  totalWrongAnswers
}) => {
  return <>
      <div className="flex items-center gap-4">
        <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 px-5 py-4 rounded-[10px]">
          <span className="text-xl text-[rgba(241,28,227,1)]">
            <div className="bg-white border min-h-[42px] w-14 flex items-center justify-center px-2.5 py-[9px] rounded-[10px] border-[#5f2ebe] text-center text-[#5f2ebe]">
              {progressPercentage}%
            </div>
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Aulas assistidas: {totalCompletedSections}/{totalSections}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full bg-[#5f2ebe] rounded-full" style={{
            width: `${progressPercentage}%`
          }} />
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
          <div className="text-sm text-gray-600 mb-2">Aproveitamento</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-[rgba(38,47,60,1)]">{totalCorrectAnswers}</span>
              <span className="text-gray-400">/</span>
              <span className="text-base text-gray-400">{totalWrongAnswers}</span>
            </div>
            <div className="text-sm text-gray-600">questões corretas/erradas</div>
          </div>
        </div>
      </div>
    </>;
};
