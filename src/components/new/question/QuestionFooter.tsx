
import React from "react";
import { Brain } from "lucide-react";

interface QuestionFooterProps {
  commentsCount: number;
  showComments: boolean;
  showAnswer: boolean;
  showOfficialAnswer: boolean;
  showAIAnswer: boolean;
  onToggleComments: () => void;
  onToggleAnswer: () => void;
  onToggleOfficialAnswer: () => void;
  onToggleAIAnswer: () => void;
  hasSelectedOption?: boolean;
}
export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  commentsCount,
  showComments,
  showAnswer,
  showOfficialAnswer,
  showAIAnswer,
  onToggleComments,
  onToggleAnswer,
  onToggleOfficialAnswer,
  onToggleAIAnswer,
  hasSelectedOption = false
}) => {
  return <footer className="flex flex-wrap justify-between items-center py-5 px-2 md:px-6 w-full text-sm md:text-base font-bold text-center gap-2">
      <button onClick={onToggleAnswer} disabled={!hasSelectedOption} className={`flex gap-1 md:gap-2.5 justify-center self-stretch px-1 py-1 md:py-1.5 my-auto text-fuchsia-500 whitespace-nowrap rounded-xl border border-fuchsia-500 border-solid max-w-[180px] md:max-w-[200px] min-w-[120px] md:min-w-[184px] w-auto md:w-[194px] transition-colors ${hasSelectedOption ? 'hover:bg-fuchsia-50' : 'opacity-50 cursor-not-allowed'}`}>
        <span className="flex flex-1 shrink gap-1 md:gap-2.5 justify-center items-center py-1 md:py-2.5 pr-1 md:pr-8 pl-1 md:pl-8 basis-0 px-1 md:px-[10px]">
          <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/288c66bfe62029abf7528c9022abe131a86bde5c1210391982a321891847fdb8" alt="Answer Icon" className="object-contain shrink-0 self-stretch my-auto aspect-square w-[14px] md:w-[19px]" />
          <span className="text-xs md:text-base">RESPONDER</span>
        </span>
      </button>

      <button onClick={onToggleComments} className={`flex flex-1 shrink gap-1 md:gap-2.5 justify-center self-stretch px-1 py-1 md:py-1.5 my-auto rounded-xl border border-purple-400 border-solid basis-0 max-w-[180px] md:max-w-60 min-w-[120px] md:min-w-[194px] hover:bg-purple-50 transition-colors ${showComments ? "text-gray-700 bg-purple-100" : "text-purple-400 bg-white"}`}>
        <span className="flex flex-1 shrink gap-1 md:gap-2.5 justify-center items-center py-1 md:py-2.5 basis-0 px-1 md:px-[10px]">
          <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/283f4447cbe56834c54388a50ccfdcc43812b0b2d3ac6dcb10eee6172a18a930" alt="Messages Icon" className="object-contain shrink-0 self-stretch my-auto w-3 md:w-4 aspect-square" />
          <span className="text-xs md:text-base">
            MENSAGENS <span className="font-normal text-purple-800">({commentsCount})</span>
          </span>
        </span>
      </button>

      <button onClick={onToggleOfficialAnswer} className={`flex flex-1 shrink gap-1 md:gap-2.5 justify-center self-stretch px-1 py-1 md:py-1.5 my-auto rounded-xl border border-purple-400 border-solid basis-0 max-w-[200px] md:max-w-[300px] min-w-[180px] md:min-w-[250px] hover:bg-purple-50 transition-colors ${showOfficialAnswer ? "text-gray-700 bg-purple-100" : "text-purple-400 bg-white"}`}>
        <span className="flex flex-1 shrink gap-1 md:gap-2.5 justify-center items-center py-1 md:py-2.5 basis-0 min-w-[120px] md:min-w-60 px-1 md:px-[10px]">
          <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/174f9704483f501cce9c4ad9f0dc87d07a661f005489418fe45e6629b528100c" alt="Answer Key Icon" className="object-contain shrink-0 self-stretch my-auto w-3 md:w-4 aspect-square" />
          <span className="text-xs md:text-base">GABARITO COMENTADO</span>
        </span>
      </button>

      <button onClick={onToggleAIAnswer} className={`flex shrink-0 justify-center items-center px-4 py-3 md:py-4 rounded-xl border border-purple-400 hover:bg-purple-50 transition-colors ${showAIAnswer ? "text-gray-700 bg-purple-100" : "text-purple-400 bg-white"}`}>
        <Brain className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </footer>;
};
