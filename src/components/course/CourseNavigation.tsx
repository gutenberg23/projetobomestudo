import React, { useEffect, useCallback, useRef, useState, memo } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Target, RotateCcw, Scale, Layers, PieChart, ChevronLeft, ChevronRight } from "lucide-react";
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
  /** Ainda não se sabe se é curso ou disciplina, ou quais abas têm conteúdo */
  carregandoTipo?: boolean;
  /** O curso tem edital, simulados ou leis secas cadastrados */
  temEdital?: boolean;
  temSimulados?: boolean;
  temLeiSeca?: boolean;
}

/**
 * Observa uma barra com rolagem horizontal e diz se ainda há conteúdo
 * escondido à esquerda ou à direita. Só indica algo quando há overflow,
 * então em telas largas (ou com poucas abas) nada aparece.
 */
function useIndicadorRolagem() {
  const [elemento, setElemento] = useState<HTMLDivElement | null>(null);
  const [lados, setLados] = useState({ esquerda: false, direita: false });

  const atualizar = useCallback(() => {
    if (!elemento) return;
    const { scrollLeft, scrollWidth, clientWidth } = elemento;
    const esquerda = scrollLeft > 4;
    const direita = scrollLeft + clientWidth < scrollWidth - 4;
    setLados((atual) =>
      atual.esquerda === esquerda && atual.direita === direita ? atual : { esquerda, direita }
    );
  }, [elemento]);

  useEffect(() => {
    if (!elemento) {
      setLados({ esquerda: false, direita: false });
      return;
    }
    atualizar();
    elemento.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    const observador = typeof ResizeObserver !== "undefined" ? new ResizeObserver(atualizar) : null;
    observador?.observe(elemento);
    // As abas podem mudar de tamanho (ex.: contador de flashcards); observa os filhos também
    Array.from(elemento.children).forEach((filho) => observador?.observe(filho));
    const mutacoes = typeof MutationObserver !== "undefined"
      ? new MutationObserver(() => {
          Array.from(elemento.children).forEach((filho) => observador?.observe(filho));
          atualizar();
        })
      : null;
    mutacoes?.observe(elemento, { childList: true });
    return () => {
      elemento.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
      observador?.disconnect();
      mutacoes?.disconnect();
    };
  }, [elemento, atualizar]);

  const rolar = useCallback((sentido: 1 | -1) => {
    if (!elemento) return;
    elemento.scrollBy({ left: sentido * Math.max(120, elemento.clientWidth * 0.6), behavior: "smooth" });
  }, [elemento]);

  return { ref: setElemento, elemento, ...lados, rolar };
}

export const CourseNavigation: React.FC<CourseNavigationProps> = memo(({
  activeTab,
  setActiveTab,
  mostrarFlashcards = false,
  totalFlashcards = 0,
  ehDisciplina = false,
  carregandoTipo = false,
  temEdital = true,
  temSimulados = true,
  temLeiSeca = true
}) => {
  const { config, isLoading } = useSiteConfig();
  const rolagem = useIndicadorRolagem();
  const { elemento: barraAbas } = rolagem;

  // Mantém a aba ativa visível na barra (útil no celular, quando a aba fica fora da tela)
  useEffect(() => {
    if (!barraAbas) return;
    const ativa = barraAbas.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!ativa) return;
    const inicio = ativa.offsetLeft - barraAbas.offsetLeft;
    const fim = inicio + ativa.offsetWidth;
    if (inicio < barraAbas.scrollLeft || fim > barraAbas.scrollLeft + barraAbas.clientWidth) {
      barraAbas.scrollTo({ left: Math.max(0, inicio - 24), behavior: "smooth" });
    }
  }, [activeTab, barraAbas]);

  // Efeito para ajustar a aba ativa quando a visibilidade muda
  useEffect(() => {
    if (isLoading || ehDisciplina) return;

    const { showDisciplinasTab, showCicloTab } = config.tabs;
    // Edital e Simulados sem conteúdo no curso contam como escondidas
    const showEditalTab = config.tabs.showEditalTab && temEdital;
    const showSimuladosTab = config.tabs.showSimuladosTab && temSimulados;

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
  }, [config.tabs, activeTab, isLoading, setActiveTab, ehDisciplina, temEdital, temSimulados]);

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
  // e as abas Edital, Simulados e Lei Seca só aparecem quando o curso tem conteúdo para elas
  const showEditalTab = config.tabs.showEditalTab && !ehDisciplina && temEdital;
  const showSimuladosTab = config.tabs.showSimuladosTab && !ehDisciplina && temSimulados;
  const showCicloTab = config.tabs.showCicloTab && !ehDisciplina;
  const showLeiSecaTab = !ehDisciplina && temLeiSeca;

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
          <div className="relative min-w-0 flex-1">
          <div
            ref={rolagem.ref}
            role="tablist"
            className="flex items-center gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-2"
          >
            {showDisciplinasTab && (
              <button
                onClick={handleDisciplinasClick}
                className={cn(
                  "course-nav-button flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 md:px-4 md:py-4 text-sm md:text-base text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] border-b-2 border-transparent hover:border-[#5f2ebe] transition-colors rounded-none",
                  activeTab === 'disciplinas' && "text-[#5f2ebe] border-[#5f2ebe]"
                )}
                role="tab"
                aria-selected={activeTab === 'disciplinas'}
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
                role="tab"
                aria-selected={activeTab === 'estatisticas'}
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
                role="tab"
                aria-selected={activeTab === 'edital'}
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
                role="tab"
                aria-selected={activeTab === 'simulados'}
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
                role="tab"
                aria-selected={activeTab === 'ciclo'}
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
            
                role="tab"
                aria-selected={activeTab === 'leiseca'}
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
                role="tab"
                aria-selected={activeTab === 'flashcards'}
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
          {/* Indicativo de que dá para deslizar: só aparece quando há abas escondidas */}
          <button
            type="button"
            aria-label="Ver abas anteriores"
            tabIndex={-1}
            onClick={() => rolagem.rolar(-1)}
            className={cn(
              "absolute inset-y-0 left-0 flex w-12 items-center justify-start bg-gradient-to-r from-white via-white/90 to-transparent pl-0.5 text-[#5f2ebe] transition-opacity duration-200",
              rolagem.esquerda ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Ver mais abas"
            tabIndex={-1}
            onClick={() => rolagem.rolar(1)}
            className={cn(
              "absolute inset-y-0 right-0 flex w-16 items-center justify-end bg-gradient-to-l from-white via-white/90 to-transparent pr-0.5 text-[#5f2ebe] transition-opacity duration-200",
              rolagem.direita ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <ChevronRight className="h-5 w-5 animate-[deslize-dica_1.6s_ease-in-out_3]" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
});