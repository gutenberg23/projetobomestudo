
"use client";

import React, { useEffect, useState } from "react";
import type { Section } from "../types";

interface VideoSectionProps {
  selectedSection: string;
  sections: Section[];
  videoHeight: number;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  selectedSection,
  sections,
  videoHeight
}) => {
  const currentSection = sections.find(s => s.id === selectedSection);
  const [responsiveHeight, setResponsiveHeight] = useState(videoHeight);
  
  useEffect(() => {
    const handleResize = () => {
      // Ajusta a altura do vídeo de acordo com a largura da tela
      const parentElement = document.querySelector('.video-container');
      if (parentElement) {
        const width = parentElement.clientWidth;
        // Calculando a altura baseada em uma proporção de aspecto 16:9
        const calculatedHeight = (width * 9) / 16;
        setResponsiveHeight(calculatedHeight);
      }
    };
    
    // Chama handleResize quando o componente monta
    handleResize();
    
    // Adiciona event listener para resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="video-container w-full">
      <div 
        className="aspect-video bg-slate-200 rounded-xl" 
        style={{ height: responsiveHeight || 'auto' }}
      >
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Vídeo da aula: {currentSection?.title}
        </div>
      </div>
    </div>
  );
};
