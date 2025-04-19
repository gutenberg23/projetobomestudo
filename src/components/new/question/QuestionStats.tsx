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
  const [statsVersion, setStatsVersion] = useState(0);
  const [statsCleared, setStatsCleared] = useState(false);

  useEffect(() => {
    // Função para lidar com o evento de limpeza de estatísticas
    const handleStatsClearedEvent = (event: Event) => {
      console.log('Evento de limpeza de estatísticas detectado', event);
      const customEvent = event as CustomEvent;
      
      // Verificar se o evento afeta esta questão específica
      if (
        !questionId || 
        customEvent.detail?.questionId === 'all' || 
        customEvent.detail?.questionId === questionId
      ) {
        console.log(`Limpando estatísticas para a questão ${questionId}`);
        setStatsCleared(true);
        setStatsVersion(prev => prev + 1);
        
        // Resetar os dados imediatamente para zero
        setPerformanceData([
          { name: "Acertos", value: 0, color: "#4ade80" },
          { name: "Erros", value: 0, color: "#ef4444" },
        ]);
        
        // Verificar o tipo de questão para definir o formato correto de alternativas
        if (questionId) {
          // Tentar buscar o tipo da questão usando async/await em uma IIFE
          (async () => {
            try {
              const { data, error } = await supabase
                .from('questoes')
                .select('questiontype')
                .eq('id', questionId)
                .single();
              
              if (error) throw error;
              
              if (data && data.questiontype === "Certo ou Errado") {
                setAlternativesData([
                  { name: "C", value: 0, color: "#F4D03F" },
                  { name: "E", value: 0, color: "#E59866" },
                ]);
              } else {
                setAlternativesData([
                  { name: "A", value: 0, color: "#F8C471" },
                  { name: "B", value: 0, color: "#5DADE2" },
                  { name: "C", value: 0, color: "#F4D03F" },
                  { name: "D", value: 0, color: "#ABEBC6" },
                  { name: "E", value: 0, color: "#E59866" },
                ]);
              }
            } catch (error) {
              console.error("Erro ao buscar tipo da questão:", error);
              // Em caso de erro, usar o formato padrão
              setAlternativesData([
                { name: "A", value: 0, color: "#F8C471" },
                { name: "B", value: 0, color: "#5DADE2" },
                { name: "C", value: 0, color: "#F4D03F" },
                { name: "D", value: 0, color: "#ABEBC6" },
                { name: "E", value: 0, color: "#E59866" },
              ]);
            }
          })();
        } else {
          // Se não temos ID da questão, usar o formato padrão
          setAlternativesData([
            { name: "A", value: 0, color: "#F8C471" },
            { name: "B", value: 0, color: "#5DADE2" },
            { name: "C", value: 0, color: "#F4D03F" },
            { name: "D", value: 0, color: "#ABEBC6" },
            { name: "E", value: 0, color: "#E59866" },
          ]);
        }
      }
    };

    // Registrar para o evento 'questionStatsCleared'
    window.addEventListener('questionStatsCleared', handleStatsClearedEvent);

    // Limpar o event listener quando o componente for desmontado
    return () => {
      window.removeEventListener('questionStatsCleared', handleStatsClearedEvent);
    };
  }, [questionId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Se as estatísticas foram limpas, não precisamos buscar novos dados
        if (statsCleared) {
          console.log("Estatísticas foram limpas, usando dados zerados");
          setIsLoading(false);
          return;
        }
        
        if (!questionId) {
          // Dados de exemplo para quando não há ID de questão
          setPerformanceData([
            { name: "Acertos", value: 0, color: "#4ade80" },
            { name: "Erros", value: 0, color: "#ef4444" },
          ]);
          
          // Como não sabemos o tipo da questão, usamos o formato padrão
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
        
        console.log(`Buscando estatísticas para questão ${questionId}, versão ${statsVersion}`);
        
        // Buscar estatísticas de acertos e erros
        const { data: respostasData, error: respostasError } = await supabase
          .from('respostas_alunos')
          .select('questao_id, aluno_id, is_correta, created_at')
          .eq('questao_id', questionId)
          .order('created_at', { ascending: false });
          
        if (respostasError) throw respostasError;
        
        // Usar apenas a resposta mais recente de cada aluno
        const respostasPorAluno = new Map<string, boolean>();
        respostasData?.forEach(resposta => {
          if (!respostasPorAluno.has(resposta.aluno_id)) {
            respostasPorAluno.set(resposta.aluno_id, resposta.is_correta);
          }
        });
        
        // Calcular acertos e erros
        const acertos = Array.from(respostasPorAluno.values()).filter(r => r).length;
        const erros = respostasPorAluno.size - acertos;
        
        setPerformanceData([
          { name: "Acertos", value: acertos || 0, color: "#4ade80" },
          { name: "Erros", value: erros || 0, color: "#ef4444" },
        ]);
        
        // Obter estatísticas de alternativas mais respondidas
        const { data: alternativasData, error: alternativasError } = await supabase
          .from('respostas_alunos')
          .select('aluno_id, opcao_id, created_at')
          .eq('questao_id', questionId)
          .order('created_at', { ascending: false });
          
        if (alternativasError) throw alternativasError;
        
        // Contar respostas por alternativa (apenas a mais recente de cada aluno)
        const alternativasPorAluno = new Map<string, string>();
        alternativasData?.forEach(resposta => {
          if (!alternativasPorAluno.has(resposta.aluno_id)) {
            alternativasPorAluno.set(resposta.aluno_id, resposta.opcao_id);
          }
        });
        
        // Contar frequência de cada alternativa
        const alternativasCounts: Record<string, number> = {};
        alternativasPorAluno.forEach((opcaoId) => {
          if (alternativasCounts[opcaoId]) {
            alternativasCounts[opcaoId]++;
          } else {
            alternativasCounts[opcaoId] = 1;
          }
        });
        
        // Buscar informações das alternativas disponíveis
        type AlternativaItem = { name: string; id?: string; value: number; color: string };
        let alternativas: AlternativaItem[] = [];
        
        if (Object.keys(alternativasCounts).length > 0) {
          // Obter a questão para mapear os IDs às letras
          const { data: questaoData } = await supabase
            .from('questoes')
            .select('options, questiontype')
            .eq('id', questionId)
            .single();
            
          if (questaoData && questaoData.options) {
            const options = Array.isArray(questaoData.options) ? questaoData.options : [];
            const questionType = questaoData.questiontype;
            
            // Mapear os IDs das opções para letras
            // Usar C e E para questões do tipo "Certo ou Errado"
            alternativas = options.map((option: any, index: number) => {
              let letter;
              if (questionType === "Certo ou Errado") {
                letter = index === 0 ? "C" : "E";
              } else {
                // Para outros tipos, use as letras comuns (A, B, C, etc.)
                letter = String.fromCharCode(65 + index); // A, B, C, D, E
              }
              
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
          // Verificar o tipo de questão para determinar as alternativas padrão
          const { data: questaoType } = await supabase
            .from('questoes')
            .select('questiontype')
            .eq('id', questionId)
            .single();
            
            if (questaoType && questaoType.questiontype === "Certo ou Errado") {
              alternativas = [
                { name: "C", value: 0, color: "#F4D03F" },
                { name: "E", value: 0, color: "#E59866" },
              ];
            } else {
              alternativas = [
                { name: "A", value: 0, color: "#F8C471" },
                { name: "B", value: 0, color: "#5DADE2" },
                { name: "C", value: 0, color: "#F4D03F" },
                { name: "D", value: 0, color: "#ABEBC6" },
                { name: "E", value: 0, color: "#E59866" },
              ];
            }
        }
        
        setAlternativesData(alternativas);
        
        // Resetar o estado de limpeza
        setStatsCleared(false);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        
        // Dados de exemplo para fallback
        setPerformanceData([
          { name: "Acertos", value: 0, color: "#4ade80" },
          { name: "Erros", value: 0, color: "#ef4444" },
        ]);
        
        try {
          // Tentar buscar o tipo de questão mesmo no caso de erro nas estatísticas
          const { data: questaoType } = await supabase
            .from('questoes')
            .select('questiontype')
            .eq('id', questionId)
            .single();
            
          if (questaoType && questaoType.questiontype === "Certo ou Errado") {
            setAlternativesData([
              { name: "C", value: 0, color: "#F4D03F" },
              { name: "E", value: 0, color: "#E59866" },
            ]);
          } else {
            setAlternativesData([
              { name: "A", value: 0, color: "#F8C471" },
              { name: "B", value: 0, color: "#5DADE2" },
              { name: "C", value: 0, color: "#F4D03F" },
              { name: "D", value: 0, color: "#ABEBC6" },
              { name: "E", value: 0, color: "#E59866" },
            ]);
          }
        } catch {
          // Se falhar ao buscar o tipo, usar formato padrão
          setAlternativesData([
            { name: "A", value: 0, color: "#F8C471" },
            { name: "B", value: 0, color: "#5DADE2" },
            { name: "C", value: 0, color: "#F4D03F" },
            { name: "D", value: 0, color: "#ABEBC6" },
            { name: "E", value: 0, color: "#E59866" },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [questionId, statsVersion, statsCleared]); // Adicionamos statsCleared como dependência
  
  const getAlternativaColor = (index: number) => {
    const colors = ["#F8C471", "#5DADE2", "#F4D03F", "#ABEBC6", "#E59866"];
    return colors[index % colors.length];
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-md p-2 w-full md:w-[300px] max-w-full flex justify-center items-center h-[150px]">
        <p className="text-[#67748a]">Carregando estatísticas...</p>
      </div>
    );
  }
  
  const totalRespostas = performanceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-md p-2 w-full md:w-[300px] max-w-full">
      <div className="flex flex-col gap-2">
        <div className="p-2 border rounded-md w-full">
          <h3 className="text-center text-[#272f3c] font-medium mb-1 text-xs md:text-sm">
            Percentual de Rendimento {totalRespostas > 0 ? `(${totalRespostas} respostas)` : '(Sem respostas)'}
          </h3>
          <div className="h-[120px] md:h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-2 border rounded-md w-full">
          <h3 className="text-center text-[#272f3c] font-medium mb-1 text-xs md:text-sm">Alternativas mais respondidas</h3>
          <div className="h-[120px] md:h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alternativesData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
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
