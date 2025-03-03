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
  id
}) => {
  return <header className="flex overflow-hidden flex-wrap justify-between items-center px-3 md:px-5 py-2.5 w-full rounded-t-xl rounded-b-none border border-gray-200 border-solid min-h-[74px] text-slate-800 bg-[#272f3c]">
      <div className="flex overflow-hidden flex-wrap flex-1 shrink gap-2.5 justify-center items-center self-stretch p-2.5 my-auto text-xl font-semibold rounded-md basis-0 min-w-60">
        <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/5b434683a48dcb3ab1d8aa45e0f2b75f8412fa47646fe3db3a95dfcf02b2ae05" alt="Question Icon" className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
        <p className="flex-1 shrink self-stretch my-auto basis-0 text-white">
          <span className="text-sm text-white">Ano: </span>
          <span className="font-normal text-sm text-white">{year}</span>
          <span className="text-sm text-white"> Banca: </span>
          <span className="font-normal text-sm text-white">{institution}</span>
          <span className="text-sm text-white"> Órgão: </span>
          <span className="font-normal text-sm text-white">{organization}</span>
          <span className="text-sm text-white"> Prova: </span>
          <span className="font-normal text-sm text-white">{role}</span>
        </p>
      </div>

      <div className="flex overflow-hidden gap-5 justify-center items-center self-stretch p-2.5 my-auto text-xs text-center whitespace-nowrap rounded-md max-sm:mx-auto">
        <span className="text-slate-500">{id}</span>
        
      </div>
    </header>;
};