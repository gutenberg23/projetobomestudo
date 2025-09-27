import { useState, useEffect } from "react";
import { DashboardSummary } from "./components/DashboardSummary";
import { SubjectTable } from "./components/SubjectTable";
import { SimuladosTable } from "./components/SimuladosTable";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { useParams } from "react-router-dom";
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
  const { subjects, loading, updateTopicProgress, forceRefresh, unsavedChanges, setUnsavedChanges, saveAllDataToDatabase, performanceGoal, updatePerformanceGoal, examDate, updateExamDate, lastSaveTime } = useEditorializedData();
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

  // Função para log com timestamp
  const logWithTimestamp = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] EditorializedView: ${message}:`, data);
    } else {
      console.log(`[${timestamp}] EditorializedView: ${message}`);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.forceRefreshEdital = () => {
        if (forceRefresh) {
          logWithTimestamp("forceRefreshEdital chamado pela janela global");
          forceRefresh();
          checkEditalExists();
        }
      };
      
      const clearCacheAndReload = async () => {
        try {
          if (courseId) {
            const realId = extractIdFromFriendlyUrl(courseId);
            localStorage.removeItem(`edital_${realId}`);
            logWithTimestamp(`Cache do localStorage para edital_${realId} removido`);
          }
          
          if (user) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              logWithTimestamp("Sessão expirada, tentando renovar");
              const { data, error } = await supabase.auth.refreshSession();
              if (error) {
                logWithTimestamp("Erro ao renovar sessão", error);
                logWithTimestamp("Usuário continuará com funcionalidade limitada");
              } else {
                logWithTimestamp("Sessão renovada com sucesso", {
                  userId: data.session?.user.id,
                  expiresAt: data.session?.expires_at
                });
              }
            } else {
              logWithTimestamp("Sessão válida encontrada", {
                userId: sessionData.session.user.id,
                expiresAt: sessionData.session.expires_at
              });
            }
          }
        } catch (error) {
          logWithTimestamp("Erro ao atualizar sessão", error);
        }
      };
      
      clearCacheAndReload();
      
      // Verificar sessão a cada 10 minutos
      const sessionCheckInterval = setInterval(async () => {
        if (user) {
          try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              logWithTimestamp("Erro ao verificar sessão no intervalo", error);
            } else if (!data.session) {
              logWithTimestamp("Sessão expirada em verificação de intervalo, tentando renovar");
              const refreshResult = await supabase.auth.refreshSession();
              logWithTimestamp("Resultado da renovação de sessão", refreshResult);
            } else {
              logWithTimestamp("Verificação de intervalo: sessão válida", {
                userId: data.session.user.id,
                expiresAt: data.session.expires_at
              });
            }
          } catch (error) {
            logWithTimestamp("Erro na verificação de intervalo da sessão", error);
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
    
    logWithTimestamp("Detectadas alterações não salvas, configurando auto-save");
    
    const autoSaveTimer = setTimeout(() => {
      logWithTimestamp("Executando auto-save após timeout");
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
      
      const timestamp = new Date().getTime();
      logWithTimestamp(`Verificando existência do edital (timestamp: ${timestamp})`);
      
      const { data, error } = await supabase
        .from('cursoverticalizado')
        .select('id, curso_id')
        .eq('curso_id', realId)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        logWithTimestamp('Erro ao verificar existência do edital', error);
      }
      
      const editalExists = !!data && !!data.id && data.curso_id === realId;
      setHasEdital(editalExists);
      logWithTimestamp('Edital existe?', { exists: editalExists, data });
      
      if (!editalExists && forceRefresh) {
        logWithTimestamp('Edital não existe, forçando refresh');
        forceRefresh();
      }
    } catch (error) {
      logWithTimestamp('Erro ao verificar existência do edital', error);
      setHasEdital(false);
    } finally {
      setIsLoadingEdital(false);
    }
  };

  const fetchSimuladosStats = async () => {
    try {
      if (!courseId || !user) return;

      const realId = extractIdFromFriendlyUrl(courseId);
      logWithTimestamp('Buscando estatísticas de simulados', { courseId: realId, userId: user.id });
      
      const { data: simuladosData, error: simuladosError } = await supabase
        .from("simulados")
        .select("*")
        .eq("curso_id", realId)
        .eq("ativo", true);

      if (simuladosError) {
        logWithTimestamp("Erro ao buscar simulados", simuladosError);
        return;
      }

      const simulados = simuladosData as Simulado[];
      logWithTimestamp("Simulados encontrados", { count: simulados.length });

      const supabaseWithCustomTables = supabase as SupabaseClientWithCustomTables;
      const { data: resultsData, error: resultsError } = await supabaseWithCustomTables
        .from("user_simulado_results")
        .select("*")
        .eq("user_id", user.id);

      if (resultsError) {
        logWithTimestamp("Erro ao buscar resultados de simulados", resultsError);
        return;
      }

      const userResults = resultsData as UserSimuladoResult[];
      logWithTimestamp("Resultados de simulados encontrados", { count: userResults.length });

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
      
      logWithTimestamp("Estatísticas de simulados calculadas", newStats);
      setSimuladosStats(newStats);
    } catch (error) {
      logWithTimestamp("Erro ao calcular estatísticas de simulados", error);
    }
  };

  const handleSaveData = async () => {
    setIsSaving(true);
    logWithTimestamp("Iniciando salvamento de dados");
    
    try {
      if (await saveAllDataToDatabase()) {
        logWithTimestamp("Dados salvos com sucesso");
        toast({
          title: "Sucesso",
          description: "Dados salvos com sucesso!",
          variant: "default"
        });
        setIsEditMode(false);
      } else {
        logWithTimestamp("Falha ao salvar dados");
        toast({
          title: "Erro",
          description: "Não foi possível salvar os dados. Tentando novamente...",
          variant: "destructive"
        });
        
        // Tentar uma segunda vez após um curto delay
        setTimeout(async () => {
          logWithTimestamp("Segunda tentativa de salvamento");
          if (await saveAllDataToDatabase()) {
            logWithTimestamp("Segunda tentativa bem sucedida");
            toast({
              title: "Sucesso",
              description: "Dados salvos com sucesso na segunda tentativa!",
              variant: "default"
            });
            setIsEditMode(false);
          } else {
            logWithTimestamp("Segunda tentativa falhou");
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
      logWithTimestamp("Erro ao salvar dados", error);
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
      logWithTimestamp("Saindo do modo de edição e salvando dados");
      handleSaveData();
    } else {
      // Se não estamos no modo de edição, iremos entrar
      logWithTimestamp("Entrando no modo de edição");
      setIsEditMode(true);
    }
  };

  if ((loading && activeTab === 'edital') || (isLoadingEdital && activeTab === 'edital')) {
    logWithTimestamp("Renderizando tela de carregamento");
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Carregando edital...</p>
      </div>
    );
  }

  if (hasEdital === false && activeTab === 'edital') {
    logWithTimestamp("Renderizando tela de edital não encontrado");
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

  logWithTimestamp("Renderizando view principal");
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
