"use client";

import * as React from "react";
import { ActionButton } from "./ActionButton";
import { AudioPlayer } from "./AudioPlayer";
import { MultiAudioPlayer } from "./MultiAudioPlayer";

interface ButtonContainerProps {
  setShowQuestions: () => void;
  showQuestions: boolean;
  pdfUrl?: string | null;
  mapaUrl?: string | null;
  resumoUrl?: string | null;
  musicaUrl?: string | string[] | null;
  resumoAudioUrl?: string | string[] | null;
  cadernoQuestoesUrl?: string | null;
  hasQuestions?: boolean;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({
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
  const openResource = (url: string | null | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between w-full max-md:flex-wrap max-md:max-w-full px-[20px]">
      <div className="flex gap-5 justify-center items-center flex-wrap">
        {hasQuestions && (
          <ActionButton 
            iconType="questoes" 
            label="Questões" 
            variant="highlight" 
            isActive={showQuestions} 
            onClick={setShowQuestions} 
          />
        )}
        
        {pdfUrl && (
          <ActionButton 
            iconType="pdf" 
            label="Aula em PDF" 
            onClick={() => openResource(pdfUrl)} 
          />
        )}
        
        {mapaUrl && (
          <ActionButton 
            iconType="mapa" 
            label="Mapa Mental" 
            onClick={() => openResource(mapaUrl)} 
          />
        )}
        
        {resumoUrl && (
          <ActionButton 
            iconType="resumo" 
            label="Resumo" 
            onClick={() => openResource(resumoUrl)} 
          />
        )}
        
        {/* Música - suporte a múltiplos arquivos */}
        {musicaUrl && (
          <>
            {Array.isArray(musicaUrl) ? (
              <MultiAudioPlayer
                audioUrls={musicaUrl}
                label="Música"
              />
            ) : (
              <AudioPlayer
                label="Música"
                audioUrl={musicaUrl}
              />
            )}
          </>
        )}
        
        {/* Resumo em Áudio - suporte a múltiplos arquivos */}
        {resumoAudioUrl && (
          <>
            {Array.isArray(resumoAudioUrl) ? (
              <MultiAudioPlayer
                audioUrls={resumoAudioUrl}
                label="Resumo em Áudio"
              />
            ) : (
              <AudioPlayer
                label="Resumo em Áudio"
                audioUrl={resumoAudioUrl}
              />
            )}
          </>
        )}
        
        {cadernoQuestoesUrl && (
          <ActionButton 
            iconType="questoes" 
            label="Caderno de Questões" 
            onClick={() => openResource(cadernoQuestoesUrl)} 
          />
        )}
      </div>
    </div>
  );
};
