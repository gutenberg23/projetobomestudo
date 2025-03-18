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
import { RefreshCw, FileX, Loader2 } from "lucide-react";
import { calculateOverallStats } from "./utils/statsCalculations";
import { toast } from "@/components/ui/use-toast";

// Interface para os resultados do simulado do usuário
interface UserSimuladoResult {
  id: string;
  user_id: string;
  simulado_id: string;
  acertos: number;
  erros: number;
  created_at: string;
  updated_at: string;
}

// Interface para os simulados
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

// Tipo para o Supabase Client estendido
type SupabaseClientWithCustomTables = typeof supabase & {
  from(table: 'user_simulado_results'): any;
};

export const EditorializedView = ({ activeTab = 'edital' }) => {
  const [performanceGoal, setPerformanceGoal] = useState<number>(70);
  const { subjects, loading, updateTopicProgress, forceRefresh } = useEditorializedData();
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

  // Efeito para limpar o cache do navegador relacionado ao edital
  useEffect(() => {
    // Limpar qualquer cache do navegador relacionado ao edital
    if (typeof window !== 'undefined') {
      // Forçar recarregamento dos dados do Supabase
      const clearCacheAndReload = async () => {
        try {
          // Limpar TODOS os dados do localStorage relacionados ao edital
          if (courseId) {
            const realId = extractIdFromFriendlyUrl(courseId);
            localStorage.removeItem(`edital_${realId}`);
            console.log(`Cache do localStorage para edital_${realId} removido`);
            
            // NÃO chamar forceRefresh() aqui para evitar loop infinito
          }
          
          if (user) {
            // Verificar se a sessão ainda é válida
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              console.log("Sessão expirada, tentando renovar");
              // Tentar renovar a sessão
              const { data, error } = await supabase.auth.refreshSession();
              if (error) {
                console.error("Erro ao renovar sessão:", error);
                // Não redirecionar, apenas mostrar mensagem
                console.log("Usuário continuará com funcionalidade limitada");
              } else {
                console.log("Sessão renovada com sucesso");
                // NÃO chamar forceRefresh() aqui para evitar loop infinito
              }
            } else {
              console.log("Sessão válida encontrada");
              // NÃO chamar forceRefresh() aqui para evitar loop infinito
            }
          }
        } catch (error) {
          console.error("Erro ao atualizar sessão:", error);
        }
      };
      
      clearCacheAndReload();
    }
  }, [user, courseId]); // Remover forceRefresh das dependências para evitar loop infinito

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
    setHasEdital(null); // Resetar o estado para garantir uma nova verificação
    
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      
      // Adicionar um timestamp para evitar cache
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
      
      // Verificação mais rigorosa
      const editalExists = !!data && !!data.id && data.curso_id === realId;
      setHasEdital(editalExists);
      console.log('Edital existe?', editalExists, 'Dados:', data);
      
      // Se não existir, forçar atualização dos dados
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
      
      // Buscar todos os simulados do curso
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

      // Buscar resultados do usuário usando type assertion
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

      // Calcular estatísticas
      const total = simulados.length;
      const realizados = userResults.filter(result => 
        simulados.some(simulado => simulado.id === result.simulado_id)
      ).length;

      // Somar questões, acertos e erros
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

  // Mostra o loading apenas na aba de edital quando estiver carregando o edital
  if ((loading && activeTab === 'edital') || (isLoadingEdital && activeTab === 'edital')) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Carregando edital...</p>
      </div>
    );
  }

  // Só verificamos a existência do edital se estivermos na aba 'edital'
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Edital Verticalizado</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso no edital
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (forceRefresh) {
                forceRefresh();
                checkEditalExists();
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar dados
          </Button>
        </div>
      </div>
      {/* Só renderiza o DashboardSummary na aba de edital se houver edital */}
      {(activeTab !== 'edital' || (activeTab === 'edital' && hasEdital)) && (
        <DashboardSummary 
          overallStats={calculateOverallStats(subjects)} 
          performanceGoal={performanceGoal} 
          setPerformanceGoal={setPerformanceGoal}
          activeTab={activeTab}
          subjects={subjects}
          simuladosStats={simuladosStats}
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
