
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation } from "./CourseNavigation";
import { SubjectsList } from "./SubjectsList";
import { ProgressPanel } from "./ProgressPanel";
import { EditorializedView } from "./EditorializedView";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";

export const CourseLayout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'edital' | 'simulados'>('disciplinas');
  const [isProgressVisible, setIsProgressVisible] = useState(true);
  const [hasMultipleDisciplines, setHasMultipleDisciplines] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const progressRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkDisciplinesCount = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        const realId = extractIdFromFriendlyUrl(courseId);
        
        // Verificar se é um curso ou uma disciplina
        let { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('disciplinas_ids')
          .eq('id', realId)
          .maybeSingle();
        
        if (cursoData && cursoData.disciplinas_ids) {
          // É um curso, verificar quantidade de disciplinas
          setHasMultipleDisciplines(cursoData.disciplinas_ids.length > 1);
        } else {
          // Provavelmente é uma disciplina única
          setHasMultipleDisciplines(false);
        }
      } catch (error) {
        console.error("Erro ao verificar disciplinas:", error);
        setHasMultipleDisciplines(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkDisciplinesCount();
  }, [courseId]);
  
  const handleProgressClick = () => {
    setIsProgressVisible(!isProgressVisible);
    if (!isProgressVisible) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="pt-[88px]">
        <CourseHeader courseId={courseId || ''} />
        {hasMultipleDisciplines && (
          <CourseNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onProgressClick={handleProgressClick} 
            isProgressVisible={isProgressVisible} 
            showNavigation={hasMultipleDisciplines}
          />
        )}
        {activeTab === 'disciplinas' && (
          <div className="bg-[rgba(246,248,250,1)] flex w-full gap-5 py-0 flex-col xl:flex-row px-[10px] md:px-[32px]">
            <div className="flex-1">
              <SubjectsList />
            </div>
            {isProgressVisible && hasMultipleDisciplines && (
              <div ref={progressRef} className="w-full xl:min-w-[300px] xl:max-w-[400px] mb-10">
                <ProgressPanel />
              </div>
            )}
          </div>
        )}
        {(activeTab === 'edital' || activeTab === 'simulados') && (
          <div className="bg-[rgba(246,248,250,1)] w-full">
            <EditorializedView activeTab={activeTab} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
