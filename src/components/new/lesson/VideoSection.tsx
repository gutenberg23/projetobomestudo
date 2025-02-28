
"use client";

import React from "react";
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
  
  return (
    <div ref={(ref) => {}} className="aspect-video bg-slate-200 rounded-xl" style={{ height: videoHeight || 'auto' }}>
      <div className="w-full h-full flex items-center justify-center text-slate-500">
        Vídeo da aula: {currentSection?.title}
      </div>
    </div>
  );
};
