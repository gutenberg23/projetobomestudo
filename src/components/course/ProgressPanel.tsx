
import React from "react";

export const ProgressPanel = () => {
  return (
    <div className="bg-white rounded-[10px] space-y-4 p-5">
      <h2 className="text-2xl font-bold text-[rgba(38,47,60,1)]">
        Seu progresso
      </h2>

      <div className="flex items-center gap-4">
        <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 px-5 py-4 rounded-[10px]">
          <span className="text-xl text-[rgba(241,28,227,1)]">
            <div className="bg-white border min-h-[42px] w-14 px-2.5 py-[9px] rounded-[10px] border-[rgba(241,28,227,1)] text-center">
              75
            </div>
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>100 horas de duração</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-full w-3/4 bg-[rgba(241,28,227,1)] rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-2">Questões respondidas</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">850</div>
            <div className="text-sm text-gray-600">de 1000 questões</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Aulas assistidas</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">42</div>
            <div className="text-sm text-gray-600">de 50 aulas</div>
          </div>
        </div>
      </div>
    </div>
  );
};
