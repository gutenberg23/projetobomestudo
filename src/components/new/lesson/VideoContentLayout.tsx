"use client";

import React, { useRef, useEffect, useState } from "react";
import type { Section } from "../types";
import { VideoSection } from "./VideoSection";
import { SectionsNavigation } from "./SectionsNavigation";

interface VideoContentLayoutProps {
  selectedSection: string;
  sections: Section[];
  completedSections?: string[];
  hasHorizontalScroll?: boolean;
  videoHeight?: number;
  setVideoHeight?: (height: number) => void;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion?: (sectionId: string, event: React.MouseEvent) => void;
}

export const VideoContentLayout: React.FC<VideoContentLayoutProps> = ({
  selectedSection,
  sections,
  completedSections = [],
  hasHorizontalScroll = false,
  videoHeight = 400,
  setVideoHeight = () => {},
  onSectionClick,
  onToggleCompletion = () => {}
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [currentVideoHeight, setCurrentVideoHeight] = useState(videoHeight);

  // Dados de exemplo do professor - em um caso real, isso viria de uma API ou props
  const teacherExample = {
    name: "Ana Maria Silva",
    photoUrl: "/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg", // Usando imagem de exemplo do projeto
    socialMedia: {
      youtube: "https://youtube.com/usuario",
      instagram: "https://instagram.com/usuario",
      telegram: "https://t.me/usuario",
      facebook: "https://facebook.com/usuario",
      twitter: "https://twitter.com/usuario"
    }
  };

  useEffect(() => {
    const updateVideoHeight = () => {
      if (videoRef.current) {
        const height = videoRef.current.offsetHeight;
        setCurrentVideoHeight(height);
        setVideoHeight(height);
      }
    };

    updateVideoHeight();
    
    // Adicionar listener para quando a janela for redimensionada
    window.addEventListener('resize', updateVideoHeight);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateVideoHeight);
    };
  }, [setVideoHeight]);

  return (
    <div className={`flex flex-col md:flex-row px-3 sm:px-5 mt-3 sm:mt-5`}>
      <div className={`w-full md:w-2/3 md:pr-5`}>
        <div ref={videoRef}>
          <VideoSection 
            selectedSection={selectedSection} 
            sections={sections}
            videoHeight={currentVideoHeight}
            teacher={teacherExample}
          />
        </div>
      </div>

      <div className={`w-full md:w-1/3 mt-3 sm:mt-4 md:mt-0`}>
        <SectionsNavigation
          sections={sections}
          selectedSection={selectedSection}
          completedSections={completedSections}
          hasHorizontalScroll={hasHorizontalScroll}
          videoHeight={currentVideoHeight}
          onSectionClick={onSectionClick}
          onToggleCompletion={onToggleCompletion}
        />
      </div>
    </div>
  );
};
