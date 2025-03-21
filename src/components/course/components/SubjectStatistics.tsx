
import React from 'react';
import { Award, CheckCircle, XCircle } from "lucide-react";

interface SubjectStatisticsProps {
  aproveitamento: number;
  questionsCorrect: number;
  questionsWrong: number;
}

export const SubjectStatistics: React.FC<SubjectStatisticsProps> = ({
  aproveitamento,
  questionsCorrect,
  questionsWrong
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="bg-white p-2 rounded text-center">
        <div className="text-xs text-[#5f2ebe] flex items-center justify-center gap-1 mb-1">
          <Award className="w-3.5 h-3.5" />
          <span>Aproveitamento</span>
        </div>
        <div className="font-semibold text-sm text-[#5f2ebe]">{aproveitamento}%</div>
      </div>
      <div className="bg-white p-2 rounded text-center">
        <div className="text-xs text-[#5f2ebe] flex items-center justify-center gap-1 mb-1">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Acertos</span>
        </div>
        <div className="font-semibold text-sm text-[#5f2ebe]">{questionsCorrect}</div>
      </div>
      <div className="bg-white p-2 rounded text-center">
        <div className="text-xs text-[#ffac33] flex items-center justify-center gap-1 mb-1">
          <XCircle className="w-3.5 h-3.5" />
          <span>Erros</span>
        </div>
        <div className="font-semibold text-sm text-[#ffac33]">{questionsWrong}</div>
      </div>
    </div>
  );
};
