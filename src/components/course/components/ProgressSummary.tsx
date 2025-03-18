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
  // Adicionar log para verificar os valores recebidos
  console.log("ProgressSummary recebeu:", { 
    totalQuestions, 
    totalCorrectAnswers, 
    totalWrongAnswers 
  });

  // Garantir que os valores são números válidos
  const ensureValidNumber = (value: any): number => {
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return !isNaN(num) ? num : 0;
  };

  // Converter para números válidos
  const validTotalQuestions = ensureValidNumber(totalQuestions);
  const validTotalCorrect = ensureValidNumber(totalCorrectAnswers);
  const validTotalWrong = ensureValidNumber(totalWrongAnswers);

  // Calcular o percentual de acertos
  const correctPercentage = validTotalQuestions > 0 
    ? Math.round((validTotalCorrect / validTotalQuestions) * 100) 
    : 0;

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
          <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">{validTotalCorrect + validTotalWrong}</div>
          <div className="text-sm text-gray-600">questões totais</div>
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-2">Aproveitamento</div>
        <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-green-600">{validTotalCorrect}</span>
            <span className="text-gray-400">/</span>
            <span className="text-base text-red-600">{validTotalWrong}</span>
            <span className="text-xs text-gray-500 ml-1">
              {validTotalCorrect + validTotalWrong > 0 
                ? `(${correctPercentage}%)`
                : '(0%)'}
            </span>
          </div>
          <div className="text-sm text-gray-600">questões corretas/erradas</div>
        </div>
      </div>
    </div>
  </>;
};
