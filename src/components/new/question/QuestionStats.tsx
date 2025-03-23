
import React, { useState, useEffect } from "react";
import { PieChart, BarChart, Cell, XAxis, YAxis, Bar, Pie, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface QuestionStatsProps {
  questionId?: string;
}

export const QuestionStats: React.FC<QuestionStatsProps> = ({ questionId = "" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<Array<any>>([]);
  const [alternativesData, setAlternativesData] = useState<Array<any>>([]);
  // Add a key to force re-render when stats are cleared
  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    // Criar um evento personalizado para atualizar as estatísticas quando forem limpas
    const handleStatsClearedEvent = () => {
      console.log('Evento de limpeza de estatísticas detectado');
      setStatsVersion(prev => prev + 1);
    };

    // Registrar para o evento 'questionStatsCleared'
    window.addEventListener('questionStatsCleared', handleStatsClearedEvent);

    // Limpar o event listener quando o componente for desmontado
    return () => {
      window.removeEventListener('questionStatsCleared', handleStatsClearedEvent);
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        if (!questionId) {
          // Dados de exemplo para quando não há ID de questão
          setPerformanceData([
            { name: "Acertos", value: 0, color: "#4ade80" },
            { name: "Erros", value: 0, color: "#ef4444" },
          ]);
          
          setAlternativesData([
            { name: "A", value: 0, color: "#F8C471" },
            { name: "B", value: 0, color: "#5DADE2" },
            { name: "C", value: 0, color: "#F4D03F" },
            { name: "D", value: 0, color: "#ABEBC6" },
            { name: "E", value: 0, color: "#E59866" },
          ]);
          
          setIsLoading(false);
          return;
        }
        
        // Obter estatísticas de acertos e erros
        const { data: respostasData, error: respostasError } = await supabase
          .from('respostas_alunos')
          .select('is_correta')
          .eq('questao_id', questionId);
          
        if (respostasError) throw respostasError;
        
        // Calcular acertos e erros
        let acertos = 0;
        let erros = 0;
        
        if (respostasData && respostasData.length > 0) {
          acertos = respostasData.filter(r => r.is_correta).length;
          erros = respostasData.filter(r => !r.is_correta).length;
        }
        
        setPerformanceData([
          { name: "Acertos", value: acertos || 0, color: "#4ade80" },
          { name: "Erros", value: erros || 0, color: "#ef4444" },
        ]);
        
        // Obter estatísticas de alternativas mais respondidas
        const { data: alternativasData, error: alternativasError } = await supabase
          .from('respostas_alunos')
          .select('opcao_id')
          .eq('questao_id', questionId);
          
        if (alternativasError) throw alternativasError;
        
        // Contar respostas por alternativa
        const alternativasCounts: Record<string, number> = {};
        
        if (alternativasData && alternativasData.length > 0) {
          alternativasData.forEach(resposta => {
            const alternativaId = resposta.opcao_id;
            if (alternativasCounts[alternativaId]) {
              alternativasCounts[alternativaId]++;
            } else {
              alternativasCounts[alternativaId] = 1;
            }
          });
        }
        
        // Buscar informações das alternativas disponíveis
        let alternativas = [];
        
        if (Object.keys(alternativasCounts).length > 0) {
          // Obter a questão para mapear os IDs às letras
          const { data: questaoData } = await supabase
            .from('questoes')
            .select('options')
            .eq('id', questionId)
            .single();
            
          if (questaoData && questaoData.options) {
            const options = Array.isArray(questaoData.options) ? questaoData.options : [];
            
            // Mapear os IDs das opções para letras (A, B, C, D, E)
            // e usar isso para plotar os resultados
            alternativas = options.map((option: any, index: number) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D, E
              const optionId = typeof option === 'object' && option !== null ? option.id : option;
              return {
                name: letter,
                id: optionId, // Armazenar o ID para garantir correspondência
                value: alternativasCounts[optionId] || 0,
                color: getAlternativaColor(index)
              };
            });
          }
        }
        
        if (alternativas.length === 0) {
          alternativas = [
            { name: "A", value: 0, color: "#F8C471" },
            { name: "B", value: 0, color: "#5DADE2" },
            { name: "C", value: 0, color: "#F4D03F" },
            { name: "D", value: 0, color: "#ABEBC6" },
            { name: "E", value: 0, color: "#E59866" },
          ];
        }
        
        setAlternativesData(alternativas);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        
        // Dados de exemplo para fallback
        setPerformanceData([
          { name: "Acertos", value: 0, color: "#4ade80" },
          { name: "Erros", value: 0, color: "#ef4444" },
        ]);
        
        setAlternativesData([
          { name: "A", value: 0, color: "#F8C471" },
          { name: "B", value: 0, color: "#5DADE2" },
          { name: "C", value: 0, color: "#F4D03F" },
          { name: "D", value: 0, color: "#ABEBC6" },
          { name: "E", value: 0, color: "#E59866" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [questionId, statsVersion]); // Adicionamos statsVersion como dependência para forçar a atualização
  
  const getAlternativaColor = (index: number) => {
    const colors = ["#F8C471", "#5DADE2", "#F4D03F", "#ABEBC6", "#E59866"];
    return colors[index % colors.length];
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-md p-3 md:p-4 w-full md:w-[600px] max-w-full flex justify-center items-center h-[200px]">
        <p className="text-[#67748a]">Carregando estatísticas...</p>
      </div>
    );
  }
  
  const totalRespostas = performanceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-md p-3 md:p-4 w-full md:w-[600px] max-w-full">
      <div className="flex flex-col gap-4">
        <div className="p-3 md:p-3 border rounded-md w-full">
          <h3 className="text-center text-[#272f3c] font-medium mb-2 md:mb-3 text-sm md:text-base">
            Percentual de Rendimento {totalRespostas > 0 ? `(${totalRespostas} respostas)` : '(Sem respostas)'}
          </h3>
          <div className="h-[180px] md:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-3 md:p-3 border rounded-md w-full">
          <h3 className="text-center text-[#272f3c] font-medium mb-2 md:mb-3 text-sm md:text-base">Alternativas mais respondidas</h3>
          <div className="h-[180px] md:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alternativesData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value">
                  {alternativesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
