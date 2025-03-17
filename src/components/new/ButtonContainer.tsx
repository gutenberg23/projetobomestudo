"use client";

import * as React from "react";
import { ActionButton } from "./ActionButton";

interface ButtonContainerProps {
  setShowQuestions: () => void;
  showQuestions: boolean;
  pdfUrl?: string | null;
  mapaUrl?: string | null;
  resumoUrl?: string | null;
  musicaUrl?: string | null;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({
  setShowQuestions,
  showQuestions,
  pdfUrl,
  mapaUrl,
  resumoUrl,
  musicaUrl
}) => {
  const openResource = (url: string | null | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between w-full max-md:flex-wrap max-md:max-w-full px-[20px]">
      <div className="flex gap-5 justify-center items-center flex-wrap">
        <ActionButton 
          icon="/lovable-uploads/interroga.svg" 
          label="Caderno de Questões" 
          variant="highlight" 
          isActive={showQuestions} 
          onClick={setShowQuestions} 
        />
        
        {pdfUrl && (
          <ActionButton 
            icon="/lovable-uploads/pdf.svg" 
            label="Aula em PDF" 
            onClick={() => openResource(pdfUrl)} 
          />
        )}
        
        {mapaUrl && (
          <ActionButton 
            icon="/lovable-uploads/mapa.svg" 
            label="Mapa Mental" 
            onClick={() => openResource(mapaUrl)} 
          />
        )}
        
        {resumoUrl && (
          <ActionButton 
            icon="/lovable-uploads/resumo.svg" 
            label="Resumo" 
            onClick={() => openResource(resumoUrl)} 
          />
        )}
        
        {musicaUrl && (
          <ActionButton 
            icon="/lovable-uploads/musica.svg" 
            label="Música" 
            onClick={() => openResource(musicaUrl)} 
          />
        )}
      </div>
    </div>
  );
};
