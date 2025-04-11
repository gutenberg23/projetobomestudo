"use client";

import * as React from "react";
import { ButtonContainer } from "./ButtonContainer";

interface ItensDaAulaProps {
  setShowQuestions: () => void;
  showQuestions: boolean;
  pdfUrl?: string | null;
  mapaUrl?: string | null;
  resumoUrl?: string | null;
  musicaUrl?: string | null;
  cadernoQuestoesUrl?: string | null;
}

const ItensDaAula: React.FC<ItensDaAulaProps> = ({
  setShowQuestions,
  showQuestions,
  pdfUrl,
  mapaUrl,
  resumoUrl,
  musicaUrl,
  cadernoQuestoesUrl
}) => {
  return (
    <main className="flex justify-between mt-5 w-full text-base font-medium text-center min-h-[74px] text-slate-800 max-md:max-w-full px-0 mx-0">
      <ButtonContainer 
        setShowQuestions={setShowQuestions} 
        showQuestions={showQuestions}
        pdfUrl={pdfUrl}
        mapaUrl={mapaUrl}
        resumoUrl={resumoUrl}
        musicaUrl={musicaUrl}
        cadernoQuestoesUrl={cadernoQuestoesUrl}
      />
    </main>
  );
};

export default ItensDaAula;
