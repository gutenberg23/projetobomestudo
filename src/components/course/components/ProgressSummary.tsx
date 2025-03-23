
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, BookOpenIcon, BarChart2, Award, ListChecks } from 'lucide-react';

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
  const [localTotalCompletedSections, setLocalTotalCompletedSections] = useState(totalCompletedSections);
  const [localTotalSections, setLocalTotalSections] = useState(totalSections);
  const [localProgressPercentage, setLocalProgressPercentage] = useState(progressPercentage);

  // Escutar eventos de atualização de seções
  useEffect(() => {
    const handleSectionsUpdated = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) {
        console.log("Evento sectionsUpdated recebido:", detail);
        if (typeof detail.totalCompleted === 'number') {
          setLocalTotalCompletedSections(detail.totalCompleted);
        }
        if (typeof detail.totalSections === 'number') {
          setLocalTotalSections(detail.totalSections);
        }
        
        // Recalcular a porcentagem de progresso
        if (typeof detail.totalCompleted === 'number' && typeof detail.totalSections === 'number' && detail.totalSections > 0) {
          const newPercentage = Math.round((detail.totalCompleted / detail.totalSections) * 100);
          setLocalProgressPercentage(newPercentage);
        }
      }
    };

    document.addEventListener('sectionsUpdated', handleSectionsUpdated);
    
    return () => {
      document.removeEventListener('sectionsUpdated', handleSectionsUpdated);
    };
  }, []);

  // Atualizar o estado local quando as props mudarem
  useEffect(() => {
    setLocalTotalCompletedSections(totalCompletedSections);
    setLocalTotalSections(totalSections);
    setLocalProgressPercentage(progressPercentage);
  }, [totalCompletedSections, totalSections, progressPercentage]);

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
      <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 px-4 py-3 rounded-[10px]">
        <Award className="text-[#5f2ebe] w-5 h-5" />
        <div className="bg-white min-h-[38px] w-12 flex items-center justify-center px-2 py-1 rounded-[8px] border-[#5f2ebe] text-center text-[#5f2ebe] font-semibold">
          {localProgressPercentage}%
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-[rgba(38,47,60,0.7)] mb-1">
          <span className="flex items-center gap-1">
            <ListChecks className="w-3.5 h-3.5" />
            Tópicos: {localTotalCompletedSections}/{localTotalSections}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(38,47,60,0.1)]">
          <div className="h-full bg-[#5f2ebe] rounded-full" style={{
            width: `${localProgressPercentage}%`
          }} />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="text-xs text-[rgba(38,47,60,0.7)] mb-1 flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5" />
          Questões respondidas
        </div>
        <div className="bg-[rgba(246,248,250,1)] p-3 rounded-[10px] text-center">
          <div className="text-xl font-bold text-[rgba(38,47,60,1)]">{validTotalCorrect + validTotalWrong}</div>
          <div className="text-xs text-[rgba(38,47,60,0.7)]">questões totais</div>
        </div>
      </div>
      <div>
        <div className="text-xs text-[rgba(38,47,60,0.7)] mb-1 flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          Aproveitamento
        </div>
        <div className="bg-[rgba(246,248,250,1)] p-3 rounded-[10px] text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4 text-[#5f2ebe]" />
            <span className="text-lg font-bold text-[#5f2ebe]">{validTotalCorrect}</span>
            <span className="text-[rgba(38,47,60,0.4)]">/</span>
            <XCircle className="w-4 h-4 text-[#ffac33]" />
            <span className="text-sm text-[#ffac33]">{validTotalWrong}</span>
            <span className="text-xs text-[rgba(38,47,60,0.7)] ml-1">
              {validTotalCorrect + validTotalWrong > 0 
                ? `(${correctPercentage}%)`
                : '(0%)'}
            </span>
          </div>
          <div className="text-xs text-[rgba(38,47,60,0.7)]">questões corretas/erradas</div>
        </div>
      </div>
    </div>
  </>;
};
