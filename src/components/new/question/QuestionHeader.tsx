import React, { useState } from "react";
import { BarChart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QuestionStats } from "./QuestionStats";

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
  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <header className="flex overflow-hidden flex-wrap justify-between items-center px-3 md:px-5 py-2.5 w-full rounded-t-xl rounded-b-none border border-gray-200 border-solid min-h-[74px] text-slate-800 bg-[#272f3c]">
      <div className="flex overflow-hidden flex-wrap flex-1 shrink gap-2.5 justify-center items-center self-stretch p-2.5 my-auto text-xl font-semibold rounded-md basis-0 min-w-60">
        <img 
          src="/lovable-uploads/interroga.svg" 
          alt="Question Icon" 
          className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" 
        />
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

      <div className="flex overflow-hidden gap-2 justify-center items-center self-stretch p-2.5 my-auto text-xs text-center whitespace-nowrap rounded-md max-sm:mx-auto">
        <span className="text-slate-500">{id}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div>
                <Popover open={statsOpen} onOpenChange={setStatsOpen}>
                  <PopoverTrigger asChild>
                    <button className="p-1 hover:bg-[#3a4253] rounded-full focus:outline-none transition-colors">
                      <BarChart className="h-4 w-4 text-white" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[45vw] md:w-[700px] p-0">
                    <QuestionStats questionId={id} />
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estatísticas da Questão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};
