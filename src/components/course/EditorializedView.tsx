import { useState, useEffect } from "react";
import { DashboardSummary } from "./components/DashboardSummary";
import { SubjectTable } from "./components/SubjectTable";
import { SimuladosTable } from "./components/SimuladosTable";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileX, Loader2 } from "lucide-react";
import { calculateOverallStats } from "./utils/statsCalculations";
import { toast } from "@/components/ui/use-toast";


declare global {
  interface Window {
    forceRefreshEdital?: () => void;
  }
}

interface EditorializedViewProps {
  courseId: string;
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

export const EditorializedView: React.FC<EditorializedViewProps> = ({ courseId, activeTab = 'edital' }) => {
  const { subjects, loading, updateTopicProgress, forceRefresh, unsavedChanges, setUnsavedChanges, saveAllDataToDatabase, performanceGoal, updatePerformanceGoal, examDate, updateExamDate, lastSaveTime } = useEditorializedData();
  const [sortBy, setSortBy] = useState<'id' | 'importance'>('id');
  const [simuladosStats, setSimuladosStats] = useState({
    total: 0,
    realizados: 0,
    questionsCount: 0,
    hits: 0,
    errors: 0
  });
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
          }
          
          if (user) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              const { data, error } = await supabase.auth.refreshSession();
              if (error) {
              } else {
              }
            } else {
            }
          }
        } catch (error) {
        }
      };
      
      clearCacheAndReload();
      
      // Verificar sessão a cada 10 minutos
      const sessionCheckInterval = setInterval(async () => {
        if (user) {
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
            } else if (!data.session) {
              const refreshResult = await supabase.auth.refreshSession();
            } else {
            }
          } catch (error) {
          }
        }
      }, 10 * 60 * 1000);
      
      return () => {
        delete window.forceRefreshEdital;
        clearInterval(sessionCheckInterval);
      };
    }
  }, [user, courseId]);

  // Auto-salvar dados se houver alterações não salvas
  useEffect(() => {
    if (!unsavedChanges || !user || !courseId) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSaveData();
    }, 2 * 60 * 1000); // Auto-save após 2 minutos
    
    return () => clearTimeout(autoSaveTimer);
  }, [unsavedChanges, user, courseId]);

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
      
      const { data, error } = await supabase
        .from('cursoverticalizado')
        .select('id, curso_id')
        .eq('curso_id', realId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
      }
      
      const editalExists = !!data && !!data.id && data.curso_id === realId;
      setHasEdital(editalExists);
      
      if (!editalExists && forceRefresh) {
        forceRefresh();
      }
    } catch (error) {
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
        return;
      }

      const simulados = simuladosData as Simulado[];

      const supabaseWithCustomTables = supabase as SupabaseClientWithCustomTables;
      const { data: resultsData, error: resultsError } = await supabaseWithCustomTables
        .from("user_simulado_results")
        .select("*")
        .eq("user_id", user.id);

      if (resultsError) {
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

      const newStats = {
        total,
        realizados,
        questionsCount,
        hits,
        errors
      };
      
      setSimuladosStats(newStats);
    } catch (error) {
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
          description: "Não foi possível salvar os dados. Tentando novamente...",
          variant: "destructive"
        });
        
        // Tentar uma segunda vez após um curto delay
        setTimeout(async () => {
          if (await saveAllDataToDatabase()) {
            toast({
              title: "Sucesso",
              description: "Dados salvos com sucesso na segunda tentativa!",
              variant: "default"
            });
            setIsEditMode(false);
          } else {
            toast({
              title: "Erro",
              description: "Não foi possível salvar os dados mesmo após nova tentativa. Por favor, tente novamente mais tarde.",
              variant: "destructive"
            });
          }
          setIsSaving(false);
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive"
      });
      setIsSaving(false);
    } finally {
      if (!isSaving) {
        setIsSaving(false);
      }
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

  const handleSortChange = (newSortBy: 'id' | 'importance') => {
    setSortBy(newSortBy);
  };

  // Removendo a ordenação de disciplinas, pois agora ordenamos apenas os tópicos dentro de cada disciplina
  const sortedSubjects = subjects; // Usar as disciplinas na ordem original

  if (loading || isLoadingEdital) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#5f2ebe]" />
      </div>
    );
  }

  // Se não temos dados e não há erro, mostrar mensagem apropriada
  if (hasEdital === false) {
    return (
      <div className="bg-white rounded-[10px] p-6 text-center">
        <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum edital encontrado</h3>
        <p className="text-gray-500">
          Este curso ainda não tem um edital configurado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(242,244,246)] rounded-[10px] pb-5 w-full">

      
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
          lastSaveTime={lastSaveTime}
          // Passando as propriedades de ordenação
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      )}

      {activeTab === 'edital' && hasEdital && (
        <>
          <StatisticsCard subjects={subjects} />
          
          {sortedSubjects.map(subject => (
            <SubjectTable
              key={subject.id}
              subject={subject}
              subjects={subjects}
              performanceGoal={performanceGoal}
              onTopicChange={updateTopicProgress}
              isEditMode={isEditMode}
              onSortChange={handleSortChange}
              sortBy={sortBy} // Passando a informação de ordenação
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