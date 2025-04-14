import React, { useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Target, BarChart } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";

interface CourseNavigationProps {
  activeTab: 'disciplinas' | 'edital' | 'simulados';
  setActiveTab: (tab: 'disciplinas' | 'edital' | 'simulados') => void;
  onProgressClick: () => void;
  isProgressVisible: boolean;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = memo(({
  activeTab,
  setActiveTab,
  onProgressClick,
  isProgressVisible
}) => {
  const { config, isLoading } = useSiteConfig();

  // Efeito para ajustar a aba ativa quando a visibilidade muda
  useEffect(() => {
    if (isLoading) return;

    const { showDisciplinasTab, showEditalTab, showSimuladosTab } = config.tabs;

    // Se a aba atual está invisível, mudar para a primeira aba visível
    if (
      (activeTab === 'disciplinas' && !showDisciplinasTab) ||
      (activeTab === 'edital' && !showEditalTab) ||
      (activeTab === 'simulados' && !showSimuladosTab)
    ) {
      if (showDisciplinasTab) {
        setActiveTab('disciplinas');
      } else if (showEditalTab) {
        setActiveTab('edital');
      } else if (showSimuladosTab) {
        setActiveTab('simulados');
      }
      // Se nenhuma aba estiver visível, não muda nada - isso deveria ser evitado pelo admin
    }
  }, [config.tabs, activeTab, isLoading, setActiveTab]);

  // Handlers de clique memorizados para evitar novas referências em cada render
  const handleDisciplinasClick = useCallback(() => {
    setActiveTab('disciplinas');
  }, [setActiveTab]);

  const handleEditalClick = useCallback(() => {
    setActiveTab('edital');
  }, [setActiveTab]);

  const handleSimuladosClick = useCallback(() => {
    setActiveTab('simulados');
  }, [setActiveTab]);

  const handleProgressClick = useCallback(() => {
    onProgressClick();
  }, [onProgressClick]);

  // Enquanto carrega, exibe um spinner de carregamento centralizado
  if (isLoading) {
    return (
      <div className="bg-white border-b border-[rgba(239,239,239,1)] mb-5">
        <div className="w-full flex justify-center">
          <div className="max-w-[1400px] w-full flex items-center justify-center px-[10px] md:px-[32px] bg-transparent py-4">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  const { showDisciplinasTab, showEditalTab, showSimuladosTab } = config.tabs;

  // Se nenhuma aba estiver visível, mostrar mensagem
  if (!showDisciplinasTab && !showEditalTab && !showSimuladosTab) {
    return (
      <div className="bg-white border-b border-[rgba(239,239,239,1)] mb-5">
        <div className="w-full flex justify-center">
          <div className="max-w-[1400px] w-full flex items-center justify-between px-[10px] md:px-[32px] bg-transparent py-4">
            <p className="text-[rgba(38,47,60,0.7)]">
              Conteúdo temporariamente indisponível. Por favor, volte mais tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-[rgba(239,239,239,1)] mb-5">
      <div className="w-full flex justify-center">
        <div className="max-w-[1400px] w-full flex items-center justify-between px-[10px] md:px-[32px] bg-transparent">
          <div className="flex items-center gap-2">
            {showDisciplinasTab && (
              <button
                onClick={handleDisciplinasClick}
                className={cn(
                  "course-nav-button flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'disciplinas' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden md:inline">Disciplinas</span>
              </button>
            )}
            {showEditalTab && (
              <button
                onClick={handleEditalClick}
                className={cn(
                  "course-nav-button flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'edital' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden md:inline">Edital</span>
              </button>
            )}
            {showSimuladosTab && (
              <button
                onClick={handleSimuladosClick}
                className={cn(
                  "course-nav-button flex items-center gap-2 px-4 py-4 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'simulados' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <Target className="w-5 h-5" />
                <span className="hidden md:inline">Simulados</span>
              </button>
            )}
          </div>
          
          {/* Botão de Progresso */}
          {activeTab === 'disciplinas' && (
            <div className="flex">
              <button
                onClick={handleProgressClick}
                className={cn(
                  "course-nav-button flex items-center gap-2 px-4 py-3 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] transition-colors rounded-none",
                  isProgressVisible && "bg-gray-100 text-[#5f2ebe]"
                )}
              >
                <BarChart className="w-5 h-5" />
                <span className="hidden md:inline">Meu Progresso</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
