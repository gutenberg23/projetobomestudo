
"use client";

import React, { useRef } from "react";
import type { Section } from "../types";
import { VideoSection } from "./VideoSection";
import { SectionsNavigation } from "./SectionsNavigation";

interface VideoContentLayoutProps {
  selectedSection: string;
  sections: Section[];
  completedSections: string[];
  hasHorizontalScroll: boolean;
  videoHeight: number;
  setVideoHeight: (height: number) => void;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion: (sectionId: string, event: React.MouseEvent) => void;
}

export const VideoContentLayout: React.FC<VideoContentLayoutProps> = ({
  selectedSection,
  sections,
  completedSections,
  hasHorizontalScroll,
  videoHeight,
  setVideoHeight,
  onSectionClick,
  onToggleCompletion
}) => {
  const videoRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      setVideoHeight(videoRef.current.offsetHeight);
    }
  }, [setVideoHeight]);

  return (
    <div className={`flex flex-col md:flex-row px-5 mt-5`}>
      <div className={`w-full md:w-2/3 md:pr-5`}>
        <div ref={videoRef}>
          <VideoSection 
            selectedSection={selectedSection} 
            sections={sections}
            videoHeight={videoHeight}
          />
        </div>
      </div>

      <div className={`w-full md:w-1/3 mt-4 md:mt-0`}>
        <SectionsNavigation
          sections={sections}
          selectedSection={selectedSection}
          completedSections={completedSections}
          hasHorizontalScroll={hasHorizontalScroll}
          videoHeight={videoHeight}
          onSectionClick={onSectionClick}
          onToggleCompletion={onToggleCompletion}
        />
      </div>
    </div>
  );
};
