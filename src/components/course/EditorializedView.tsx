import React, { useState, useEffect } from "react";
import { DashboardSummary } from "./components/DashboardSummary";
import { SubjectTable } from "./components/SubjectTable";
import { SimuladosTable } from "./components/SimuladosTable";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateOverallStats } from "./utils/statsCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { useAuth } from "@/contexts/AuthContext";

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
  const { subjects, loading, updateTopicProgress } = useEditorializedData();
  const [simuladosStats, setSimuladosStats] = useState({
    total: 0,
    realizados: 0,
    questionsCount: 0,
    hits: 0,
    errors: 0
  });
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'simulados' && courseId && user) {
      fetchSimuladosStats();
    }
  }, [activeTab, courseId, user]);

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

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8fa] rounded-[10px] pb-5 px-[10px] md:px-5">
      <DashboardSummary 
        overallStats={calculateOverallStats(subjects)} 
        performanceGoal={performanceGoal} 
        setPerformanceGoal={setPerformanceGoal}
        activeTab={activeTab}
        subjects={subjects}
        simuladosStats={simuladosStats}
      />

      {activeTab === 'edital' && (
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
