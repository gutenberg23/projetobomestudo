import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation } from "./CourseNavigation";
import { SubjectsList } from "./SubjectsList";
import { EditorializedView } from "./EditorializedView";
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

  // Função para receber o número de disciplinas e os dados das disciplinas do componente SubjectsList
  const handleSubjectsCountChange = useCallback((count: number, data?: any[]) => {
    if (data) {
      setSubjectsData(data);
      console.log("CourseLayout - Recebendo dados de disciplinas:", data.length);
    }
  }, []);

  if (!courseId) {
    return <div>Curso não encontrado</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-1 w-full">
        <CourseHeader courseId={courseId || ''} progress={progressPercentage} />
        <CourseNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        {activeTab === 'disciplinas' && config.tabs.showDisciplinasTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center relative">
            <div className="max-w-[1400px] w-full flex gap-5 py-0 flex-col xl:flex-row px-[10px] md:px-[32px]">
              <div className="flex-1">
                <SubjectsList courseId={courseId} onSubjectsCountChange={handleSubjectsCountChange} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'edital' && config.tabs.showEditalTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <EditorializedView courseId={courseId || ''} activeTab={activeTab} />
            </div>
          </div>
        )}
        
        {activeTab === 'simulados' && config.tabs.showSimuladosTab && (
          <div className="bg-[rgb(242,244,246)] w-full flex justify-center">
            <div className="max-w-[1400px] w-full py-5 px-[10px] md:px-[32px]">
              <EditorializedView courseId={courseId || ''} activeTab={activeTab} />
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