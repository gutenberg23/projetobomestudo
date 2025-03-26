import React from 'react';
import { Award, CheckCircle, XCircle, Percent } from "lucide-react";

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
        <div className="flex items-center justify-center gap-1 mb-1">
          <Percent className="w-4 h-4 text-[#5f2ebe]" />
          <div className="font-semibold text-sm text-[#5f2ebe]">{aproveitamento}%</div>
        </div>
      </div>
      <div className="bg-white p-2 rounded text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <CheckCircle className="w-4 h-4 text-[#5f2ebe]" />
          <div className="font-semibold text-sm text-[#5f2ebe]">{questionsCorrect}</div>
        </div>
      </div>
      <div className="bg-white p-2 rounded text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <XCircle className="w-4 h-4 text-[#ffac33]" />
          <div className="font-semibold text-sm text-[#ffac33]">{questionsWrong}</div>
        </div>
      </div>
    </div>
  );
};
