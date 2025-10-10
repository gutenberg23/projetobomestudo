import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation } from "./CourseNavigation";
import { SubjectsList } from "./SubjectsList";
import { ProgressPanel } from "./ProgressPanel";
import { EditorializedView } from "./EditorializedView";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { useUserProgress } from "./hooks/useUserProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { CicloTab } from "./ciclo/CicloTab";
import { LeiSecaTab } from "./leiseca/LeiSecaTab";

export const CourseLayout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'edital' | 'simulados' | 'ciclo' | 'leiseca'>('disciplinas');
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const progressPanelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  
  // Usar o hook de configurações do site
  const { config, isLoading: isLoadingConfig } = useSiteConfig();
  
  // Usar o hook de progresso com o ID do usuário atual
  const { progressPercentage } = useUserProgress(user?.id, courseId);

  // Efeito para ajustar a aba ativa quando as configurações são carregadas
  useEffect(() => {
    if (isLoadingConfig) return;
    
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
    }
  }, [config.tabs, activeTab, isLoadingConfig]);

  // Carregar dados das disciplinas quando o componente montar
  useEffect(() => {
    const fetchSubjectsData = async () => {
      if (!courseId) return;
      
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Verificar primeiro se é um curso ou uma disciplina
        // Verificar se é um curso
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('disciplinas_ids')
          .eq('id', realCourseId)
          .single();
          
        if (cursoError || !cursoData) {
          console.log("Não é um curso, verificando se é uma disciplina avulsa...");
          
          // Se não for um curso, verificar se é uma disciplina
          const { data: disciplinaData, error: disciplinaError } = await supabase
            .from('disciplinas')
            .select('*')
            .eq('id', realCourseId)
            .single();
            
          if (disciplinaError || !disciplinaData) {
            console.error('Erro ao buscar curso/disciplina:', cursoError, disciplinaError);
            return;
          }
          
          // É uma disciplina avulsa - não precisamos fazer nada porque o SubjectsList já irá carregá-la
          console.log("É uma disciplina avulsa:", disciplinaData.titulo);
          setSubjectsData([disciplinaData]);
          return;
        }
        
        // É um curso, buscar suas disciplinas
        if (cursoData.disciplinas_ids && cursoData.disciplinas_ids.length > 0) {
          const { data: disciplinasData, error: disciplinasError } = await supabase
            .from('disciplinas')
            .select('*')
            .in('id', cursoData.disciplinas_ids);
            
          if (disciplinasError || !disciplinasData) {
            console.error('Erro ao buscar disciplinas:', disciplinasError);
            return;
          }
          
          setSubjectsData(disciplinasData);
        } else {
          console.log("Curso sem disciplinas");
          setSubjectsData([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados das disciplinas:', error);
      }
    };
    
    fetchSubjectsData();
  }, [courseId]);

  const handleProgressClick = useCallback(() => {
    setIsProgressVisible(prev => !prev);
    setCurrentX(0); // Reset position when toggling
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX - currentX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.clientX - startX;
    if (x >= 0) {
      setCurrentX(x);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentX > 100) { // Se arrastou mais que 100px, fecha o painel
      setIsProgressVisible(false);
      setCurrentX(0);
    } else {
      setCurrentX(0);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (progressPanelRef.current && !progressPanelRef.current.contains(e.target as Node)) {
      setIsProgressVisible(false);
      setCurrentX(0);
    }
  };

  useEffect(() => {
    if (isProgressVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProgressVisible]);

  // Função para receber o número de disciplinas e os dados das disciplinas do componente SubjectsList
  const handleSubjectsCountChange = useCallback((count: number, data?: any[]) => {
    if (data) {
      setSubjectsData(data);
      console.log("CourseLayout - Recebendo dados de disciplinas:", data.length);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - currentX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX - startX;
    if (x >= 0) {
      setCurrentX(x);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentX > 100) { // Se arrastou mais que 100px, fecha o painel
      setIsProgressVisible(false);
      setCurrentX(0);
    } else {
      setCurrentX(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-1 w-full">
        <CourseHeader courseId={courseId || ''} progress={progressPercentage} />
        <CourseNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onProgressClick={handleProgressClick}
          isProgressVisible={isProgressVisible}
        />
        
        {activeTab === 'disciplinas' && config.tabs.showDisciplinasTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center relative">
            <div className="max-w-[1400px] w-full flex gap-5 py-0 flex-col xl:flex-row px-[10px] md:px-[32px]">
              <div className="flex-1">
                <SubjectsList courseId={courseId} onSubjectsCountChange={handleSubjectsCountChange} />
              </div>
              
              {/* Card de Progresso Flutuante */}
              <div 
                ref={progressPanelRef}
                className={cn(
                  "fixed top-[200px] right-[10px] md:right-[32px] z-[999] transition-transform duration-300 ease-in-out touch-none",
                  isProgressVisible ? "translate-x-0" : "translate-x-[100%]",
                  isDragging ? "transition-none" : ""
                )}
                style={{
                  transform: isDragging ? `translateX(${currentX}px)` : undefined,
                  visibility: isProgressVisible ? "visible" : "hidden"
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-[350px] shadow-[0_0_15px_rgba(0,0,0,0.05)] bg-white rounded-[10px] max-h-[calc(100vh-220px)] overflow-y-auto">
                  <ProgressPanel subjectsFromCourse={subjectsData} />
                </div>
              </div>

              {/* Overlay para detectar cliques fora */}
              {isProgressVisible && (
                <div
                  ref={overlayRef}
                  className="fixed inset-0 z-[998]"
                  style={{ backgroundColor: 'transparent' }}
                />
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'edital' && config.tabs.showEditalTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <EditorializedView courseId={courseId} activeTab={activeTab} />
            </div>
          </div>
        )}
        
        {activeTab === 'simulados' && config.tabs.showSimuladosTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <EditorializedView courseId={courseId} activeTab={activeTab} />
            </div>
          </div>
        )}
        
        {activeTab === 'ciclo' && config.tabs.showCicloTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <CicloTab courseId={courseId} subjects={subjectsData} />
            </div>
          </div>
        )}

        {activeTab === 'leiseca' && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <LeiSecaTab courseId={courseId} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
