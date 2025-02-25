
import React from "react";

interface QuestionFooterProps {
  commentsCount: number;
  showComments: boolean;
  showAnswer: boolean;
  onToggleComments: () => void;
  onToggleAnswer: () => void;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  commentsCount,
  showComments,
  showAnswer,
  onToggleComments,
  onToggleAnswer,
}) => {
  return (
    <footer className="flex flex-wrap justify-between items-center py-5 px-3 md:px-6 w-full text-base font-bold text-center gap-2">
      <button className="flex gap-2.5 justify-center self-stretch px-1 py-1.5 my-auto text-fuchsia-500 whitespace-nowrap rounded-xl border border-fuchsia-500 border-solid max-w-[200px] min-w-[184px] w-[194px] hover:bg-fuchsia-50 transition-colors">
        <span className="flex flex-1 shrink gap-2.5 justify-center items-center py-2.5 pr-8 pl-8 basis-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/288c66bfe62029abf7528c9022abe131a86bde5c1210391982a321891847fdb8"
            alt="Answer Icon"
            className="object-contain shrink-0 self-stretch my-auto aspect-square w-[19px]"
          />
          <span>RESPONDER</span>
        </span>
      </button>

      <button
        onClick={onToggleComments}
        className={`flex flex-1 shrink gap-2.5 justify-center self-stretch px-1 py-1.5 my-auto rounded-xl border border-purple-400 border-solid basis-0 max-w-60 min-w-[194px] hover:bg-purple-50 transition-colors ${
          showComments
            ? "text-gray-700 bg-purple-100"
            : "text-purple-400 bg-white"
        }`}
      >
        <span className="flex flex-1 shrink gap-2.5 justify-center items-center px-9 py-2.5 basis-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/283f4447cbe56834c54388a50ccfdcc43812b0b2d3ac6dcb10eee6172a18a930"
            alt="Messages Icon"
            className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
          />
          <span>
            MENSAGENS <span className="font-normal text-purple-800">({commentsCount})</span>
          </span>
        </span>
      </button>

      <button 
        onClick={onToggleAnswer}
        className={`flex flex-1 shrink gap-2.5 justify-center self-stretch px-1 py-1.5 my-auto rounded-xl border border-purple-400 border-solid basis-0 max-w-[300px] min-w-[250px] hover:bg-purple-50 transition-colors ${
          showAnswer
            ? "text-gray-700 bg-purple-100"
            : "text-purple-400 bg-white"
        }`}
      >
        <span className="flex flex-1 shrink gap-2.5 justify-center items-center px-3 py-2.5 basis-0 min-w-60">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/174f9704483f501cce9c4ad9f0dc87d07a661f005489418fe45e6629b528100c"
            alt="Answer Key Icon"
            className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
          />
          <span>GABARITO COMENTADO</span>
        </span>
      </button>
    </footer>
  );
};

