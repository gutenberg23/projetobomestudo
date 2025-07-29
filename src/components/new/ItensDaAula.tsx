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
  resumoAudioUrl?: string | null;
  cadernoQuestoesUrl?: string | null;
  hasQuestions?: boolean;
}

const ItensDaAula: React.FC<ItensDaAulaProps> = ({
  setShowQuestions,
  showQuestions,
  pdfUrl,
  mapaUrl,
  resumoUrl,
  musicaUrl,
  resumoAudioUrl,
  cadernoQuestoesUrl,
  hasQuestions = false
}) => {
  return (
    <main className="flex justify-between w-full text-base font-medium text-center min-h-[74px] text-slate-800 max-md:max-w-full px-0 mx-0">
      <ButtonContainer 
        setShowQuestions={setShowQuestions} 
        showQuestions={showQuestions}
        pdfUrl={pdfUrl}
        mapaUrl={mapaUrl}
        resumoUrl={resumoUrl}
        musicaUrl={musicaUrl}
        resumoAudioUrl={resumoAudioUrl}
        cadernoQuestoesUrl={cadernoQuestoesUrl}
        hasQuestions={hasQuestions}
      />
    </main>
  );
};

export default ItensDaAula;
