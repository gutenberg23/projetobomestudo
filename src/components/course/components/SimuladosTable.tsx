import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";

interface Simulado {
  id: string;
  titulo: string;
  questoes_ids: string[];
  hits?: number;
  errors?: number;
}

interface SimuladosTableProps {
  performanceGoal: number;
}

export const SimuladosTable = ({ performanceGoal }: SimuladosTableProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os resultados do usuário para um simulado específico
  const fetchUserSimuladoResults = async (simuladoId: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error("Erro ao obter usuário atual:", userError);
        return { hits: 0, errors: 0 };
      }
      
      const userId = userData.user.id;
      
      // Buscar os resultados do usuário para este simulado
      const { data, error } = await supabase
        .from("user_simulado_results")
        .select("acertos, erros")
        .eq("user_id", userId)
        .eq("simulado_id", simuladoId)
        .maybeSingle();
      
      if (error) {
        console.error(`Erro ao buscar resultados para simulado ${simuladoId}:`, error);
        return { hits: 0, errors: 0 };
      }
      
      if (data) {
        return { 
          hits: data.acertos || 0, 
          errors: data.erros || 0 
        };
      }
      
      return { hits: 0, errors: 0 };
    } catch (error) {
      console.error(`Erro ao processar resultados para simulado ${simuladoId}:`, error);
      return { hits: 0, errors: 0 };
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
            errors: userResults.errors
          });
        }

        setSimulados(formattedSimulados);
      } catch (error) {
        console.error("Erro ao carregar simulados:", error);
        toast.error("Erro ao carregar simulados. Tente novamente.");
        setSimulados([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimulados();
  }, [courseId]);

  const calculatePerformance = (hits: number = 0, total: number = 0) => {
    if (total === 0) return 0;
    return Math.round((hits / total) * 100);
  };

  const totals = simulados.reduce(
    (acc, simulado) => ({
      questionsCount: acc.questionsCount + simulado.questoes_ids.length,
      hits: acc.hits + (simulado.hits || 0),
      errors: acc.errors + (simulado.errors || 0),
    }),
    { questionsCount: 0, hits: 0, errors: 0 }
  );

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
              <th className="py-3 px-4 text-left font-medium">#</th>
              <th className="py-3 px-4 text-left font-medium">Título</th>
              <th className="py-3 px-4 text-center font-medium">Questões</th>
              <th className="py-3 px-4 text-center font-medium">Acertos</th>
              <th className="py-3 px-4 text-center font-medium">Erros</th>
              <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
            </tr>
          </thead>
          <tbody>
            {simulados.map((simulado, index) => (
              <tr key={simulado.id} className="border-t border-gray-200">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">
                  <a 
                    href={`/simulado/${simulado.id}`} 
                    className="text-[#5f2ebe] hover:underline"
                  >
                    {simulado.titulo}
                  </a>
                </td>
                <td className="py-3 px-4 text-center">{simulado.questoes_ids.length}</td>
                <td className="py-3 px-4 text-center">{simulado.hits || 0}</td>
                <td className="py-3 px-4 text-center">{simulado.errors || 0}</td>
                <td className={cn(
                  "py-3 px-4 text-center",
                  calculatePerformance(simulado.hits, simulado.questoes_ids.length) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
                )}>
                  {calculatePerformance(simulado.hits, simulado.questoes_ids.length)}%
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-200 bg-gray-50 font-medium">
              <td colSpan={2} className="py-3 px-4 text-right">Totais:</td>
              <td className="py-3 px-4 text-center">{totals.questionsCount}</td>
              <td className="py-3 px-4 text-center">{totals.hits}</td>
              <td className="py-3 px-4 text-center">{totals.errors}</td>
              <td className={cn(
                "py-3 px-4 text-center",
                calculatePerformance(totals.hits, totals.questionsCount) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
              )}>
                {calculatePerformance(totals.hits, totals.questionsCount)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
