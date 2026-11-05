import React, { useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Target, RotateCcw, Scale, Layers, PieChart } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Spinner } from "@/components/ui/spinner";

export type CourseTab = 'disciplinas' | 'edital' | 'simulados' | 'ciclo' | 'leiseca' | 'flashcards' | 'estatisticas';

interface CourseNavigationProps {
  activeTab: CourseTab;
  setActiveTab: (tab: CourseTab) => void;
  /** A aba Flashcards só aparece quando o curso tem flashcards */
  mostrarFlashcards?: boolean;
  totalFlashcards?: number;
  /**
   * Link de uma disciplina avulsa (e não de um curso): mostra só as abas
   * Disciplina, Estatísticas e Flashcards.
   */
  ehDisciplina?: boolean;
  /** Ainda não se sabe se é curso ou disciplina */
  carregandoTipo?: boolean;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = memo(({
  activeTab,
  setActiveTab,
  mostrarFlashcards = false,
  totalFlashcards = 0,
  ehDisciplina = false,
  carregandoTipo = false
}) => {
  const { config, isLoading } = useSiteConfig();

  // Efeito para ajustar a aba ativa quando a visibilidade muda
  useEffect(() => {
    if (isLoading || ehDisciplina) return;

    const { showDisciplinasTab, showEditalTab, showSimuladosTab, showCicloTab } = config.tabs;

    // Se a aba atual está invisível, mudar para a primeira aba visível
    if (
      (activeTab === 'disciplinas' && !showDisciplinasTab) ||
      (activeTab === 'edital' && !showEditalTab) ||
      (activeTab === 'simulados' && !showSimuladosTab) ||
      (activeTab === 'ciclo' && !showCicloTab)
    ) {
      if (showDisciplinasTab) {
        setActiveTab('disciplinas');
      } else if (showEditalTab) {
        setActiveTab('edital');
      } else if (showSimuladosTab) {
        setActiveTab('simulados');
      } else if (showCicloTab) {
        setActiveTab('ciclo');
      }
      // Se nenhuma aba estiver visível, não muda nada - isso deveria ser evitado pelo admin
    }
  }, [config.tabs, activeTab, isLoading, setActiveTab, ehDisciplina]);

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
  
  const handleCicloClick = useCallback(() => {
    setActiveTab('ciclo');
  }, [setActiveTab]);

  const handleLeiSecaClick = useCallback(() => {
    setActiveTab('leiseca');
  }, [setActiveTab]);

  const handleFlashcardsClick = useCallback(() => {
    setActiveTab('flashcards');
  }, [setActiveTab]);

  const handleEstatisticasClick = useCallback(() => {
    setActiveTab('estatisticas');
  }, [setActiveTab]);

  // Enquanto carrega, exibe um spinner de carregamento centralizado
  if (isLoading || carregandoTipo) {
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

  const { showDisciplinasTab } = config.tabs;
  // Disciplina avulsa não tem edital, simulados, ciclo nem lei seca
  const showEditalTab = config.tabs.showEditalTab && !ehDisciplina;
  const showSimuladosTab = config.tabs.showSimuladosTab && !ehDisciplina;
  const showCicloTab = config.tabs.showCicloTab && !ehDisciplina;
  const showLeiSecaTab = !ehDisciplina;

  // Se nenhuma aba estiver visível, mostrar mensagem
  if (!ehDisciplina && !showDisciplinasTab && !showEditalTab && !showSimuladosTab && !showCicloTab) {
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
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-2">
            {showDisciplinasTab && (
              <button
                onClick={handleDisciplinasClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'disciplinas' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <BookOpen className="w-5 h-5" />
                <span>{ehDisciplina ? 'Disciplina' : 'Disciplinas'}</span>
              </button>
            )}
            {ehDisciplina && (
              <button
                onClick={handleEstatisticasClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'estatisticas' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <PieChart className="w-5 h-5" />
                <span>Estatísticas</span>
              </button>
            )}
            {showEditalTab && (
              <button
                onClick={handleEditalClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'edital' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <FileText className="w-5 h-5" />
                <span>Edital</span>
              </button>
            )}
            {showSimuladosTab && (
              <button
                onClick={handleSimuladosClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'simulados' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <Target className="w-5 h-5" />
                <span>Simulados</span>
              </button>
            )}
            {showCicloTab && (
              <button
                onClick={handleCicloClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'ciclo' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Ciclo</span>
              </button>
            )}
            {showLeiSecaTab && (
            <button
              onClick={handleLeiSecaClick}
              className={cn(
                "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                activeTab === 'leiseca' && "text-[#5f2ebe] border-[#5f2ebe]"
              )}
            >
              <Scale className="w-5 h-5" />
              <span>Lei Seca</span>
            </button>
            )}
            {mostrarFlashcards && (
              <button
                onClick={handleFlashcardsClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'flashcards' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
              >
                <Layers className="w-5 h-5" />
                <span>Flashcards</span>
                {totalFlashcards > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      activeTab === 'flashcards' ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {totalFlashcards}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});