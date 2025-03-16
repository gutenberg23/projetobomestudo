import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";

// Definição de tipo para a tabela user_simulado_results
interface UserSimuladoResult {
  id?: string;
  user_id: string;
  simulado_id: string;
  acertos: number;
  erros: number;
  created_at?: string;
  updated_at?: string;
}

// Tipo para o Supabase Client estendido
type SupabaseClientWithCustomTables = typeof supabase & {
  from(table: 'user_simulado_results'): any;
};

interface Simulado {
  id: string;
  titulo: string;
  questoes_ids: string[];
  hits?: number;
  errors?: number;
  realizado?: boolean;
}

interface SimuladosTableProps {
  performanceGoal: number;
  onStatsUpdate?: (stats: {
    total: number;
    realizados: number;
    questionsCount: number;
    hits: number;
    errors: number;
  }) => void;
}

export const SimuladosTable = ({ performanceGoal, onStatsUpdate }: SimuladosTableProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os resultados do usuário para um simulado específico
  const fetchUserSimuladoResults = async (simuladoId: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error("Erro ao obter usuário atual:", userError);
        return { hits: 0, errors: 0, realizado: false };
      }
      
      const userId = userData.user.id;
      
      // Buscar os resultados do usuário para este simulado
      // Usando type assertion para evitar erros de TypeScript
      const supabaseWithCustomTables = supabase as SupabaseClientWithCustomTables;
      const { data, error } = await supabaseWithCustomTables
        .from("user_simulado_results")
        .select("acertos, erros")
        .eq("user_id", userId)
        .eq("simulado_id", simuladoId)
        .maybeSingle();
      
      if (error) {
        console.error(`Erro ao buscar resultados para simulado ${simuladoId}:`, error);
        return { hits: 0, errors: 0, realizado: false };
      }
      
      if (data) {
        return { 
          hits: data.acertos || 0, 
          errors: data.erros || 0,
          realizado: true
        };
      }
      
      return { hits: 0, errors: 0, realizado: false };
    } catch (error) {
      console.error(`Erro ao processar resultados para simulado ${simuladoId}:`, error);
      return { hits: 0, errors: 0, realizado: false };
    }
  };

  useEffect(() => {
    const fetchSimulados = async () => {
      try {
        setIsLoading(true);
        
        if (!courseId) {
          setSimulados([]);
          return;
        }

        // Extrair o ID real da URL amigável
        const realId = extractIdFromFriendlyUrl(courseId);
        console.log("ID real para simulados:", realId);

        // Primeiro, vamos verificar se o curso existe
        const { data: cursoData, error: cursoError } = await supabase
          .from("cursos")
          .select("id")
          .eq("id", realId)
          .maybeSingle();
          
        if (cursoError) {
          console.error("Erro ao verificar curso:", cursoError);
          throw cursoError;
        }
        
        if (!cursoData) {
          console.log("Curso não encontrado:", realId);
          toast.error("Curso não encontrado");
          setSimulados([]);
          return;
        }

        // Agora buscar os simulados associados ao curso
        const { data, error } = await supabase
          .from("simulados")
          .select("*")
          .eq("curso_id", cursoData.id.toString())
          .eq("ativo", true);

        if (error) {
          console.error("Erro ao buscar simulados:", error);
          throw error;
        }

        console.log("Simulados encontrados:", data);

        // Transformar os dados para o formato esperado pelo componente
        const formattedSimulados: Simulado[] = [];
        
        // Para cada simulado, buscar os resultados do usuário
        for (const simulado of data) {
          const userResults = await fetchUserSimuladoResults(simulado.id);
          
          formattedSimulados.push({
            id: simulado.id,
            titulo: simulado.titulo,
            questoes_ids: simulado.questoes_ids || [],
            hits: userResults.hits,
            errors: userResults.errors,
            realizado: userResults.realizado
          });
        }

        setSimulados(formattedSimulados);

        // Calcular e atualizar as estatísticas para o DashboardSummary
        if (onStatsUpdate) {
          const completedSimulados = formattedSimulados.filter(simulado => simulado.realizado);
          
          const totals = completedSimulados.reduce(
            (acc, simulado) => ({
              questionsCount: acc.questionsCount + simulado.questoes_ids.length,
              hits: acc.hits + (simulado.hits || 0),
              errors: acc.errors + (simulado.errors || 0),
            }),
            { questionsCount: 0, hits: 0, errors: 0 }
          );

          onStatsUpdate({
            total: formattedSimulados.length,
            realizados: completedSimulados.length,
            questionsCount: totals.questionsCount,
            hits: totals.hits,
            errors: totals.errors
          });
        }
      } catch (error) {
        console.error("Erro ao carregar simulados:", error);
        toast.error("Erro ao carregar simulados. Tente novamente.");
        setSimulados([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimulados();
  }, [courseId, onStatsUpdate]);

  const calculatePerformance = (hits: number = 0, total: number = 0) => {
    if (total === 0) return 0;
    return Math.round((hits / total) * 100);
  };

  // Função para iniciar ou refazer um simulado
  const handleStartSimulado = (simuladoId: string) => {
    // Redirecionar para a página do simulado
    window.location.href = `/simulado/${simuladoId}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[10px] p-5 text-center">
        <p className="text-[#67748a]">Carregando simulados...</p>
      </div>
    );
  }

  if (simulados.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-5 text-center">
        <p className="text-[#67748a]">Nenhum simulado disponível para este curso.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] p-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="px-4 py-3 text-left font-medium">Simulado</th>
              <th className="px-4 py-3 text-center font-medium">Questões</th>
              <th className="px-4 py-3 text-center font-medium">Acertos</th>
              <th className="px-4 py-3 text-center font-medium">Erros</th>
              <th className="px-4 py-3 text-center font-medium">Aproveitamento</th>
              <th className="px-4 py-3 text-center font-medium">Realizado</th>
              <th className="px-4 py-3 text-center font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {simulados.map((simulado) => {
              const totalQuestions = simulado.questoes_ids.length;
              const hits = simulado.hits || 0;
              const errors = simulado.errors || 0;
              const performance = calculatePerformance(hits, totalQuestions);
              const isCompleted = simulado.realizado || false;

              return (
                <tr key={simulado.id} className="text-sm text-gray-700 hover:bg-gray-50">
                  <td className="px-4 py-3">{simulado.titulo}</td>
                  <td className="px-4 py-3 text-center">{totalQuestions}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">
                    {isCompleted ? hits : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600 font-medium">
                    {isCompleted ? errors : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isCompleted ? (
                      <div className="flex items-center justify-center">
                        <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              performance >= performanceGoal
                                ? "bg-green-600"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${performance}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 font-medium">{performance}%</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isCompleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Não
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleStartSimulado(simulado.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isCompleted ? "Refazer" : "Iniciar"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Linha de totais - agora só considera simulados realizados */}
            <tr className="bg-gray-50 font-medium text-sm">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-center">
                {simulados
                  .filter(s => s.realizado)
                  .reduce((acc, s) => acc + s.questoes_ids.length, 0)}
              </td>
              <td className="px-4 py-3 text-center text-green-600">
                {simulados
                  .filter(s => s.realizado)
                  .reduce((acc, s) => acc + (s.hits || 0), 0)}
              </td>
              <td className="px-4 py-3 text-center text-red-600">
                {simulados
                  .filter(s => s.realizado)
                  .reduce((acc, s) => acc + (s.errors || 0), 0)}
              </td>
              <td className="px-4 py-3 text-center">
                {calculatePerformance(
                  simulados
                    .filter(s => s.realizado)
                    .reduce((acc, s) => acc + (s.hits || 0), 0),
                  simulados
                    .filter(s => s.realizado)
                    .reduce((acc, s) => acc + s.questoes_ids.length, 0)
                )}%
              </td>
              <td className="px-4 py-3 text-center">
                {simulados.filter(s => s.realizado).length}/{simulados.length}
              </td>
              <td className="px-4 py-3 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
