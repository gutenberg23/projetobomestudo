
import React, { useState, useEffect } from "react";
import { DashboardSummary } from "./components/DashboardSummary";
import { SubjectTable } from "./components/SubjectTable";
import { SimuladosTable } from "./components/SimuladosTable";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, FileX, Loader2, PencilIcon, Save } from "lucide-react";
import { calculateOverallStats } from "./utils/statsCalculations";
import { toast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    forceRefreshEdital?: () => void;
  }
}

interface EditorializedViewProps {
  activeTab?: string;
}

interface UserSimuladoResult {
  id: string;
  user_id: string;
  simulado_id: string;
  acertos: number;
  erros: number;
  created_at: string;
  updated_at: string;
}

interface Simulado {
  id: string;
  titulo: string;
  curso_id: string;
  questoes_ids: string[];
  ativo: boolean;
  created_at: string;
  data_inicio?: string;
  data_fim?: string;
  quantidade_questoes?: number;
}

type SupabaseClientWithCustomTables = typeof supabase & {
  from(table: 'user_simulado_results'): any;
};

export const EditorializedView = ({ activeTab = 'edital' }: EditorializedViewProps) => {
  const { subjects, loading, updateTopicProgress, forceRefresh, unsavedChanges, setUnsavedChanges, saveAllDataToDatabase, performanceGoal, updatePerformanceGoal, examDate, updateExamDate } = useEditorializedData();
  const [simuladosStats, setSimuladosStats] = useState({
    total: 0,
    realizados: 0,
    questionsCount: 0,
    hits: 0,
    errors: 0
  });
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [hasEdital, setHasEdital] = useState<boolean | null>(null);
  const [isLoadingEdital, setIsLoadingEdital] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.forceRefreshEdital = () => {
        if (forceRefresh) {
          forceRefresh();
          checkEditalExists();
        }
      };
      
      const clearCacheAndReload = async () => {
        try {
          if (courseId) {
            const realId = extractIdFromFriendlyUrl(courseId);
            localStorage.removeItem(`edital_${realId}`);
            console.log(`Cache do localStorage para edital_${realId} removido`);
          }
          
          if (user) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              console.log("Sessão expirada, tentando renovar");
              const { data, error } = await supabase.auth.refreshSession();
              if (error) {
                console.error("Erro ao renovar sessão:", error);
                console.log("Usuário continuará com funcionalidade limitada");
              } else {
                console.log("Sessão renovada com sucesso");
              }
            } else {
              console.log("Sessão válida encontrada");
            }
          }
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
        }
      };
      
      clearCacheAndReload();
      
      return () => {
        delete window.forceRefreshEdital;
      };
    }
  }, [user, courseId]);

  useEffect(() => {
    if (activeTab === 'simulados' && courseId && user) {
      fetchSimuladosStats();
    }
  }, [activeTab, courseId, user]);

  useEffect(() => {
    if (courseId && activeTab === 'edital') {
      checkEditalExists();
    }
  }, [courseId, activeTab]);

  const checkEditalExists = async () => {
    if (!courseId) return;
    
    setIsLoadingEdital(true);
    setHasEdital(null);
    
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      
      const timestamp = new Date().getTime();
      console.log(`Verificando existência do edital (timestamp: ${timestamp})`);
      
      const { data, error } = await supabase
        .from('cursoverticalizado')
        .select('id, curso_id')
        .eq('curso_id', realId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar existência do edital:', error);
      }
      
      const editalExists = !!data && !!data.id && data.curso_id === realId;
      setHasEdital(editalExists);
      console.log('Edital existe?', editalExists, 'Dados:', data);
      
      if (!editalExists && forceRefresh) {
        forceRefresh();
      }
    } catch (error) {
      console.error('Erro ao verificar existência do edital:', error);
      setHasEdital(false);
    } finally {
      setIsLoadingEdital(false);
    }
  };

  const fetchSimuladosStats = async () => {
    try {
      if (!courseId || !user) return;

      const realId = extractIdFromFriendlyUrl(courseId);
      
      const { data: simuladosData, error: simuladosError } = await supabase
        .from("simulados")
        .select("*")
        .eq("curso_id", realId)
        .eq("ativo", true);

      if (simuladosError) {
        console.error("Erro ao buscar simulados:", simuladosError);
        return;
      }

      const simulados = simuladosData as Simulado[];

      const supabaseWithCustomTables = supabase as SupabaseClientWithCustomTables;
      const { data: resultsData, error: resultsError } = await supabaseWithCustomTables
        .from("user_simulado_results")
        .select("*")
        .eq("user_id", user.id);

      if (resultsError) {
        console.error("Erro ao buscar resultados:", resultsError);
        return;
      }

      const userResults = resultsData as UserSimuladoResult[];

      const total = simulados.length;
      const realizados = userResults.filter(result => 
        simulados.some(simulado => simulado.id === result.simulado_id)
      ).length;

      let questionsCount = 0;
      let hits = 0;
      let errors = 0;

      simulados.forEach(simulado => {
        const userResult = userResults.find(result => result.simulado_id === simulado.id);
        if (userResult) {
          questionsCount += simulado.questoes_ids?.length || 0;
          hits += userResult.acertos || 0;
          errors += userResult.erros || 0;
        }
      });

      setSimuladosStats({
        total,
        realizados,
        questionsCount,
        hits,
        errors
      });
    } catch (error) {
      console.error("Erro ao calcular estatísticas de simulados:", error);
    }
  };

  const handleSaveData = async () => {
    setIsSaving(true);
    
    try {
      if (await saveAllDataToDatabase()) {
        toast({
          title: "Sucesso",
          description: "Dados salvos com sucesso!",
          variant: "default"
        });
        setIsEditMode(false);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar os dados. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Se estamos no modo de edição, iremos salvar e sair
      handleSaveData();
    } else {
      // Se não estamos no modo de edição, iremos entrar
      setIsEditMode(true);
    }
  };

  if ((loading && activeTab === 'edital') || (isLoadingEdital && activeTab === 'edital')) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Carregando edital...</p>
      </div>
    );
  }

  if (hasEdital === false && activeTab === 'edital') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileX className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Edital não encontrado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Não foi possível encontrar o edital para este curso.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8fa] rounded-[10px] pb-5 px-[10px] md:px-5">
      {(activeTab !== 'edital' || (activeTab === 'edital' && hasEdital)) && (
        <DashboardSummary 
          overallStats={calculateOverallStats(subjects)} 
          performanceGoal={performanceGoal} 
          setPerformanceGoal={updatePerformanceGoal}
          activeTab={activeTab}
          subjects={subjects}
          simuladosStats={simuladosStats}
          loading={loading}
          isEditMode={isEditMode}
          onToggleEditMode={handleEditModeToggle}
          isSaving={isSaving}
          unsavedChanges={unsavedChanges}
          setUnsavedChanges={setUnsavedChanges}
          saveAllDataToDatabase={saveAllDataToDatabase}
          examDate={examDate}
          updateExamDate={updateExamDate}
        />
      )}

      {activeTab === 'edital' && hasEdital && (
        <>
          <StatisticsCard subjects={subjects} />
          
          {subjects.map(subject => (
            <SubjectTable
              key={subject.id}
              subject={subject}
              performanceGoal={performanceGoal}
              onTopicChange={updateTopicProgress}
              isEditMode={isEditMode}
            />
          ))}
          
          {subjects.length === 0 && (
            <div className="text-center py-8 text-[#67748a]">
              Nenhuma disciplina encontrada para este edital.
            </div>
          )}
        </>
      )}

      {activeTab === 'simulados' && (
        <SimuladosTable 
          performanceGoal={performanceGoal} 
          onStatsUpdate={setSimuladosStats}
        />
      )}
    </div>
  );
};
