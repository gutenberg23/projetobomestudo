
import React, { RefObject } from "react";
import { CheckCircle, Circle } from "lucide-react";

interface Section {
  id: string;
  title: string;
  videoUrl?: string;
  content?: string;
  isActive?: boolean;
}

interface SectionsNavigationProps {
  sections: Section[];
  selectedSection: string;
  completedSections: string[];
  hasHorizontalScroll: boolean;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion: (sectionId: string, event: React.MouseEvent) => void;
  sectionsContainerRef: RefObject<HTMLDivElement>;
  selectedSectionRef: RefObject<HTMLLIElement>;
}

export const SectionsNavigation: React.FC<SectionsNavigationProps> = ({
  sections,
  selectedSection,
  completedSections,
  hasHorizontalScroll,
  onSectionClick,
  onToggleCompletion,
  sectionsContainerRef,
  selectedSectionRef
}) => {
  return (
    <div className="mb-4 relative">
      {hasHorizontalScroll && (
        <>
          <div className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </>
      )}
      
      <div 
        ref={sectionsContainerRef}
        className="overflow-x-auto scrollbar-none md:overflow-x-visible"
      >
        <ul className="flex space-x-2 py-2 px-2 md:flex-wrap md:gap-2">
          {sections.map((section) => {
            const isSelected = section.id === selectedSection;
            const isCompleted = completedSections.includes(section.id);
            
            return (
              <li
                key={section.id}
                ref={isSelected ? selectedSectionRef : null}
                className={`
                  flex-shrink-0 cursor-pointer group transition-all duration-300
                  ${isSelected ? 'bg-[#5f2ebe] text-white' : isCompleted ? 'bg-[#f0f4ff] text-[#5f2ebe]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  rounded-full px-4 py-2 flex items-center gap-2 max-w-[calc(100vw-40px)] md:max-w-xs
                `}
                onClick={() => onSectionClick(section.id)}
              >
                <button
                  className={`
                    flex-shrink-0 transition-all duration-200
                    ${isSelected ? 'text-white' : isCompleted ? 'text-[#5f2ebe]' : 'text-gray-400 group-hover:text-gray-600'}
                  `}
                  onClick={(e) => onToggleCompletion(section.id, e)}
                  aria-label={isCompleted ? "Marcar como não concluído" : "Marcar como concluído"}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} className="fill-current" />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>
                <span className="truncate text-sm font-medium">{section.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
