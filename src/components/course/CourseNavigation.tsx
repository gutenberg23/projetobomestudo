import React from "react";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Target } from "lucide-react";

interface CourseNavigationProps {
  activeTab: 'disciplinas' | 'edital' | 'simulados';
  setActiveTab: (tab: 'disciplinas' | 'edital' | 'simulados') => void;
  onProgressClick: () => void;
  isProgressVisible: boolean;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = ({
  activeTab,
  setActiveTab,
  onProgressClick,
  isProgressVisible
}) => {
  return (
    <div className="bg-white border-b border-[rgba(239,239,239,1)] mb-5">
      <div className="mx-auto flex min-w-60 w-full items-center justify-between flex-wrap px-[10px] md:px-[32px] bg-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('disciplinas')}
            className={cn(
              "flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors",
              activeTab === 'disciplinas' && "text-[#5f2ebe] border-[#5f2ebe]"
            )}
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden md:inline">Disciplinas</span>
          </button>
          <button
            onClick={() => setActiveTab('edital')}
            className={cn(
              "flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors",
              activeTab === 'edital' && "text-[#5f2ebe] border-[#5f2ebe]"
            )}
          >
            <FileText className="w-5 h-5" />
            <span className="hidden md:inline">Edital</span>
          </button>
          <button
            onClick={() => setActiveTab('simulados')}
            className={cn(
              "flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors",
              activeTab === 'simulados' && "text-[#5f2ebe] border-[#5f2ebe]"
            )}
          >
            <Target className="w-5 h-5" />
            <span className="hidden md:inline">Simulados</span>
          </button>
        </div>
      </div>
    </div>
  );
};
