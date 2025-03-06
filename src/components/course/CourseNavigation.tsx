
import React from "react";

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
    <div className="w-full bg-white border-b border-[rgba(239,239,239,1)]">
      <div className="w-full flex items-center justify-between px-[10px] md:px-[32px]">
        <nav className="flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('disciplinas')}
            className={`flex justify-center items-center px-5 py-3 text-[#67748a] border-b-[3px] transition-colors ${
              activeTab === 'disciplinas' ? 'border-[#5f2ebe] text-[#5f2ebe]' : 'border-transparent'
            }`}
          >
            <span className="text-base font-normal whitespace-nowrap">Disciplinas</span>
          </button>
          <button
            onClick={() => setActiveTab('edital')}
            className={`flex justify-center items-center px-5 py-3 text-[#67748a] border-b-[3px] transition-colors ${
              activeTab === 'edital' ? 'border-[#5f2ebe] text-[#5f2ebe]' : 'border-transparent'
            }`}
          >
            <span className="text-base font-normal whitespace-nowrap">Edital</span>
          </button>
          <button
            onClick={() => setActiveTab('simulados')}
            className={`flex justify-center items-center px-5 py-3 text-[#67748a] border-b-[3px] transition-colors ${
              activeTab === 'simulados' ? 'border-[#5f2ebe] text-[#5f2ebe]' : 'border-transparent'
            }`}
          >
            <span className="text-base font-normal whitespace-nowrap">Simulados</span>
          </button>
        </nav>
        
        {activeTab === 'disciplinas' && (
          <button
            onClick={onProgressClick}
            className={`flex items-center gap-1 text-sm font-medium text-[#5f2ebe] py-1 px-3 rounded-md ${
              isProgressVisible ? 'bg-[#ede7f9]' : 'bg-transparent hover:bg-[#ede7f9]'
            } transition-colors`}
          >
            <span>{isProgressVisible ? 'Ocultar Progresso' : 'Mostrar Progresso'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
