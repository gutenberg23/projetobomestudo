
import React from "react";
import { Check, Lock } from "lucide-react";
import type { Section } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SectionsNavigationProps {
  sections: Section[];
  selectedSection: string;
  completedSections?: string[];
  hasHorizontalScroll?: boolean;
  videoHeight?: number;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion?: (sectionId: string, event: React.MouseEvent) => void;
}

export const SectionsNavigation: React.FC<SectionsNavigationProps> = ({
  sections,
  selectedSection,
  completedSections = [],
  hasHorizontalScroll = false,
  videoHeight = 400,
  onSectionClick,
  onToggleCompletion = () => {}
}) => {
  // Dispara evento de atualização quando um tópico é marcado como concluído
  const handleToggleCompletion = (sectionId: string, evt: React.MouseEvent) => {
    onToggleCompletion(sectionId, evt);
    
    // Após marcar a conclusão, disparar evento customizado para atualizar o painel de progresso
    const completedCount = sections.filter(section => 
      completedSections.includes(section.id)
    ).length;
    
    // Se estamos desmarcando, precisamos subtrair 1 do contador
    const isRemoving = completedSections.includes(sectionId);
    const adjustedCount = isRemoving ? completedCount - 1 : completedCount + 1;
    
    // Disparar evento
    const customEvent = new CustomEvent('sectionsUpdated', {
      detail: {
        totalCompleted: adjustedCount,
        totalSections: sections.length
      }
    });
    document.dispatchEvent(customEvent);
    console.log(`Evento sectionsUpdated disparado: ${adjustedCount}/${sections.length}`);
    
    // Disparar também evento para a conclusão de tópicos individual
    document.dispatchEvent(new CustomEvent('topicCompleted'));
  };

  return (
    <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-sm">
      <div className="p-3 border-b border-[#e5e7eb]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-medium text-[#272f3c] tracking-tight">Tópicos da aula</h3>
          <div className="text-[13px] text-[#67748a]">
            {completedSections.length}/{sections.length}
          </div>
        </div>
      </div>
      
      <ScrollArea 
        className="overflow-y-auto overflow-x-hidden" 
        style={{ 
          maxHeight: videoHeight || '400px',
          ...(hasHorizontalScroll ? {} : { overflowX: 'hidden' })
        }}
      >
        <div className="p-0">
          {sections.map((section, index) => {
            const isActive = section.id === selectedSection;
            const isCompleted = completedSections.includes(section.id);
            const isLocked = section.locked || false;
            
            return (
              <div
                key={section.id}
                className={`relative border-b border-[#e5e7eb] last:border-b-0 ${
                  isLocked ? 'bg-gray-50 cursor-not-allowed' : isActive ? 'bg-[rgba(95,46,190,0.03)]' : 'hover:bg-[rgba(246,248,250,0.7)] cursor-pointer'
                }`}
              >
                <div
                  className="flex p-3 items-start"
                  onClick={() => !isLocked && onSectionClick(section.id)}
                >
                  <div 
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                      isCompleted 
                        ? 'bg-[#5f2ebe] text-white' 
                        : isLocked 
                          ? 'bg-gray-200 text-gray-400' 
                          : 'bg-[rgba(246,248,250,1)] border border-[#e5e7eb]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <span className="text-xs font-medium text-[#67748a]">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-[14px] font-medium ${isLocked ? 'text-gray-400' : 'text-[#272f3c]'}`}>
                      {section.title}
                    </div>
                    {section.duration && (
                      <div className="text-[12px] text-[#67748a]">
                        {section.duration}
                      </div>
                    )}
                  </div>
                  
                  {!isLocked && (
                    <div 
                      className="ml-2 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompletion(section.id, e);
                      }}
                    >
                      <div 
                        className={`w-5 h-5 rounded border ${
                          isCompleted 
                            ? 'bg-[#5f2ebe] border-[#5f2ebe]' 
                            : 'bg-white border-gray-300'
                        } flex items-center justify-center cursor-pointer`}
                      >
                        {isCompleted && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
