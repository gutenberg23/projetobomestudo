import React, { useState, useEffect, useCallback } from "react";
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

export const CourseLayout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'edital' | 'simulados'>('disciplinas');
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [subjectsCount, setSubjectsCount] = useState<number>(0);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  
  // Usar o hook de configurações do site
  const { config, isLoading: isLoadingConfig } = useSiteConfig();
  
  // Usar o hook de progresso com o ID do usuário atual
  const { progressPercentage } = useUserProgress(user?.id, courseId);

  // Efeito para ajustar a aba ativa quando as configurações são carregadas
  useEffect(() => {
    if (isLoadingConfig) return;
    
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
    }
  }, [config.tabs, activeTab, isLoadingConfig]);

  // Carregar dados das disciplinas quando o componente montar
  useEffect(() => {
    const fetchSubjectsData = async () => {
      if (!courseId) return;
      
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Buscar o curso para obter os IDs das disciplinas
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('disciplinas_ids')
          .eq('id', realCourseId)
          .single();
          
        if (cursoError || !cursoData?.disciplinas_ids) {
          console.error('Erro ao buscar curso:', cursoError);
          return;
        }
        
        // Buscar todas as disciplinas do curso
        const { data: disciplinasData, error: disciplinasError } = await supabase
          .from('disciplinas')
          .select('*')
          .in('id', cursoData.disciplinas_ids);
          
        if (disciplinasError || !disciplinasData) {
          console.error('Erro ao buscar disciplinas:', disciplinasError);
          return;
        }
        
        setSubjectsData(disciplinasData);
        setSubjectsCount(disciplinasData.length);
      } catch (error) {
        console.error('Erro ao buscar dados das disciplinas:', error);
      }
    };
    
    fetchSubjectsData();
  }, [courseId]);

  const handleProgressClick = useCallback(() => {
    setIsProgressVisible(!isProgressVisible);
  }, [isProgressVisible]);

  // Função para receber o número de disciplinas e os dados das disciplinas do componente SubjectsList
  const handleSubjectsCountChange = useCallback((count: number, data?: any[]) => {
    if (data) {
      setSubjectsData(data);
      setSubjectsCount(count);
      console.log("CourseLayout - Recebendo dados de disciplinas:", data.length);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col">
      <Header />
      <main className="pt-[88px] flex-1">
        <CourseHeader courseId={courseId || ''} progress={progressPercentage} />
        <CourseNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onProgressClick={handleProgressClick}
          isProgressVisible={isProgressVisible}
        />
        
        {activeTab === 'disciplinas' && config.tabs.showDisciplinasTab && (
          <div className="bg-[rgba(246,248,250,1)] flex w-full gap-5 py-0 flex-col xl:flex-row px-[10px] md:px-[32px] relative">
            <div className="flex-1">
              <SubjectsList courseId={courseId} onSubjectsCountChange={handleSubjectsCountChange} />
            </div>
            
            {/* Card de Progresso Flutuante */}
            <div 
              className={cn(
                "fixed top-[200px] right-[10px] md:right-[32px] z-[999] transition-transform duration-300 ease-in-out",
                isProgressVisible ? "translate-x-0" : "translate-x-[calc(100%+10px)]"
              )}
            >
              <button 
                onClick={handleProgressClick}
                className="absolute left-0 top-4 -translate-x-full bg-[#5f2ebe] p-2 rounded-l-lg shadow-sm hover:bg-[#4a1fa0] transition-colors"
              >
                {isProgressVisible ? (
                  <ChevronRight className="w-5 h-5 text-white" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-white" />
                )}
              </button>
              <div className="w-[350px] shadow-[0_0_15px_rgba(0,0,0,0.05)] bg-white rounded-[10px] max-h-[calc(100vh-220px)] overflow-y-auto">
                <ProgressPanel subjectsFromCourse={subjectsData} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'edital' && config.tabs.showEditalTab && (
          <div className="container mx-auto px-[10px] md:px-0">
            <EditorializedView activeTab="edital" />
          </div>
        )}
        
        {activeTab === 'simulados' && config.tabs.showSimuladosTab && (
          <div className="container mx-auto px-[10px] md:px-0">
            <EditorializedView activeTab="simulados" />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
