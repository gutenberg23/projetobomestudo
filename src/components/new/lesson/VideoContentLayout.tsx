
import React, { useRef, useEffect } from "react";
import { SectionsNavigation } from "./SectionsNavigation";
import { VideoSection } from "./VideoSection";

interface Section {
  id: string;
  title: string;
  videoUrl?: string;
  content?: string;
  isActive?: boolean;
}

interface VideoContentLayoutProps {
  sections: Section[];
  selectedSection: string;
  completedSections: string[];
  hasHorizontalScroll: boolean;
  videoHeight: number;
  setVideoHeight: (height: number) => void;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion: (sectionId: string, event: React.MouseEvent) => void;
}

export const VideoContentLayout: React.FC<VideoContentLayoutProps> = ({
  sections,
  selectedSection,
  completedSections,
  hasHorizontalScroll,
  videoHeight,
  setVideoHeight,
  onSectionClick,
  onToggleCompletion
}) => {
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const selectedSectionRef = useRef<HTMLLIElement>(null);
  
  // Efeito para rolar para a seção selecionada quando mudar
  useEffect(() => {
    if (selectedSectionRef.current && sectionsContainerRef.current) {
      const container = sectionsContainerRef.current;
      const selectedElement = selectedSectionRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();
      
      // Verificar se o elemento selecionado está visível
      const isVisible = 
        selectedRect.left >= containerRect.left &&
        selectedRect.right <= containerRect.right;
      
      if (!isVisible) {
        // Calcular a posição para centralizar o elemento
        const scrollTo = selectedElement.offsetLeft - (container.clientWidth / 2) + (selectedElement.clientWidth / 2);
        container.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedSection]);
  
  // Encontre a seção selecionada para exibir no vídeo
  const currentSection = sections.find(section => section.id === selectedSection) || sections[0];
  
  return (
    <div className="px-[20px]">
      <SectionsNavigation
        sections={sections}
        selectedSection={selectedSection}
        completedSections={completedSections}
        hasHorizontalScroll={hasHorizontalScroll}
        onSectionClick={onSectionClick}
        onToggleCompletion={onToggleCompletion}
        sectionsContainerRef={sectionsContainerRef}
        selectedSectionRef={selectedSectionRef}
      />
      
      <VideoSection
        section={currentSection}
        videoHeight={videoHeight}
      />
    </div>
  );
};
