
import React from "react";

interface QuestionHeaderProps {
  year: string;
  institution: string;
  organization: string;
  role: string;
  id: string;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  year,
  institution,
  organization,
  role,
  id,
}) => {
  return (
    <header className="flex overflow-hidden flex-wrap justify-between items-center px-3 md:px-5 py-2.5 w-full rounded-t-xl rounded-b-none border border-gray-100 border-solid bg-slate-50 min-h-[74px] text-slate-800">
      <div className="flex overflow-hidden flex-wrap flex-1 shrink gap-2.5 justify-center items-center self-stretch p-2.5 my-auto text-xl font-semibold rounded-md basis-0 min-w-60">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/5b434683a48dcb3ab1d8aa45e0f2b75f8412fa47646fe3db3a95dfcf02b2ae05"
          alt="Question Icon"
          className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
        />
        <p className="flex-1 shrink self-stretch my-auto basis-0">
          <span className="text-sm">Ano: </span>
          <span className="font-normal text-sm">{year}</span>
          <span className="text-sm"> Banca: </span>
          <span className="font-normal text-sm">{institution}</span>
          <span className="text-sm"> Órgão: </span>
          <span className="font-normal text-sm">{organization}</span>
          <span className="text-sm"> Prova: </span>
          <span className="font-normal text-sm">{role}</span>
        </p>
      </div>

      <div className="flex overflow-hidden gap-5 justify-center items-center self-stretch p-2.5 my-auto text-xs text-center whitespace-nowrap rounded-md max-sm:mx-auto">
        <span>{id}</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/504db5e9b44d4cf7733907a139351e9347df79d27f76a8de1ed62803c89e3f4e"
          alt="Add Question"
          className="object-contain shrink-0 self-stretch my-auto aspect-square w-[30px]"
        />
      </div>
    </header>
  );
};

