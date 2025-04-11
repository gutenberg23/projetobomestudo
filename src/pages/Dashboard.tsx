import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

// Interface para as estatísticas diárias
interface DailyStats {
  date: string;
  dia_formatado: string;
  questoes: number;
  acertos: number;
  erros: number;
}

// Interface para estatísticas por disciplina
interface DisciplinaStats {
  disciplina: string;
  certas: number;
  erradas: number;
  em_branco: number;
  total: number;
  aproveitamento: number;
}

// Interface para simulados
interface Simulado {
  id: string;
  titulo: string;
  questoes_ids: string[];
  data_realizacao: string;
  acertos: number;
  erros: number;
  nota: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState("7");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [disciplinasStats, setDisciplinasStats] = useState<DisciplinaStats[]>([]);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    acertos: 0,
    erros: 0,
    aproveitamento: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const CORES = ["#FF8042", "#5f2ebe"];

  // Buscar estatísticas com base no período selecionado
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const dias = parseInt(periodo);
        const dataInicio = subDays(new Date(), dias);
        const dataInicioFormatada = format(dataInicio, "yyyy-MM-dd");
        
        // Buscar respostas do aluno no período - modificado para não usar relacionamento direto
        const { data: respostas, error } = await supabase
          .from("respostas_alunos")
          .select("*")
          .eq("aluno_id", user.id)
          .gte("created_at", dataInicioFormatada);
        
        if (error) throw error;

        // Se encontrou respostas, busca as questões correspondentes
        if (respostas && respostas.length > 0) {
          // Criar lista de IDs de questões
          const questoesIds = respostas.map(resposta => resposta.questao_id);
          
          // Buscar questões
          const { data: questoes, error: questoesError } = await supabase
            .from("questoes")
            .select("*")
            .in("id", questoesIds);
            
          if (questoesError) throw questoesError;
          
          // Criar um mapa para fácil acesso às questões
          const questoesMap = new Map();
          if (questoes) {
            questoes.forEach(questao => {
              questoesMap.set(questao.id, questao);
            });
          }
          
          // Calcular estatísticas diárias
          const dailyStatsMap = new Map<string, DailyStats>();
          const disciplinasMap = new Map<string, DisciplinaStats>();
          
          // Inicializar mapa para cada dia do período
          for (let i = 0; i <= dias; i++) {
            const currentDate = subDays(new Date(), i);
            const date = format(currentDate, "yyyy-MM-dd");
            dailyStatsMap.set(date, {
              date: format(currentDate, "dd/MM"),
              dia_formatado: format(currentDate, "dd/MM/yyyy"),
              questoes: 0,
              acertos: 0,
              erros: 0,
            });
          }
          
          // Calcular totais
          let totalQuestoes = 0;
          let totalAcertos = 0;
          
          respostas.forEach((resposta) => {
            const questao = questoesMap.get(resposta.questao_id);
            if (!questao) return; // Ignora se a questão não foi encontrada
            
            const dataResposta = format(new Date(resposta.created_at), "yyyy-MM-dd");
            const diaStat = dailyStatsMap.get(dataResposta);
            
            if (diaStat) {
              diaStat.questoes += 1;
              
              // Verificar se a resposta está correta
              const isCorreto = resposta.opcao_id === questao.resposta_id;
              if (isCorreto) {
                diaStat.acertos += 1;
                totalAcertos += 1;
              } else {
                diaStat.erros += 1;
              }
              
              dailyStatsMap.set(dataResposta, diaStat);
              totalQuestoes += 1;
            }
            
            // Agrupar por disciplina
            const disciplina = questao.discipline || "Sem disciplina";
            if (!disciplinasMap.has(disciplina)) {
              disciplinasMap.set(disciplina, {
                disciplina,
                certas: 0,
                erradas: 0,
                em_branco: 0,
                total: 0,
                aproveitamento: 0,
              });
            }
            
            const disciplinaStat = disciplinasMap.get(disciplina)!;
            disciplinaStat.total += 1;
            
            if (resposta.opcao_id) {
              if (resposta.opcao_id === questao.resposta_id) {
                disciplinaStat.certas += 1;
              } else {
                disciplinaStat.erradas += 1;
              }
            } else {
              disciplinaStat.em_branco += 1;
            }
            
            disciplinaStat.aproveitamento = 
              disciplinaStat.total > 0 
                ? Math.round((disciplinaStat.certas / disciplinaStat.total) * 100) 
                : 0;
            
            disciplinasMap.set(disciplina, disciplinaStat);
          });
          
          // Calcular aproveitamento geral
          const aproveitamento = totalQuestoes > 0 
            ? Math.round((totalAcertos / totalQuestoes) * 100) 
            : 0;
          
          setTotalStats({
            total: totalQuestoes,
            acertos: totalAcertos,
            erros: totalQuestoes - totalAcertos,
            aproveitamento,
          });
          
          // Converter para array e ordenar por data
          const dailyStatsArray = Array.from(dailyStatsMap.values())
            .sort((a, b) => {
              const dateA = a.date.split('/').reverse().join('/');
              const dateB = b.date.split('/').reverse().join('/');
              return dateA.localeCompare(dateB);
            });
          
          const disciplinasArray = Array.from(disciplinasMap.values());
          
          setDailyStats(dailyStatsArray);
          setDisciplinasStats(disciplinasArray);
        } else {
          // Se não encontrou respostas, inicializar o mapa para os dias do período
          const emptyDailyStatsMap = new Map<string, DailyStats>();
          
          // Inicializar mapa para cada dia do período
          for (let i = 0; i <= dias; i++) {
            const currentDate = subDays(new Date(), i);
            const date = format(currentDate, "yyyy-MM-dd");
            emptyDailyStatsMap.set(date, {
              date: format(currentDate, "dd/MM"),
              dia_formatado: format(currentDate, "dd/MM/yyyy"),
              questoes: 0,
              acertos: 0,
              erros: 0,
            });
          }
          
          // Se não encontrou respostas, zera os dados
          setDailyStats(Array.from(emptyDailyStatsMap.values())
            .sort((a, b) => {
              const dateA = a.date.split('/').reverse().join('/');
              const dateB = b.date.split('/').reverse().join('/');
              return dateA.localeCompare(dateB);
            })
          );
          setDisciplinasStats([]);
          setTotalStats({
            total: 0,
            acertos: 0,
            erros: 0,
            aproveitamento: 0,
          });
        }
        
        // Buscar simulados do aluno - comentado pois a tabela não existe ainda
        try {
          // Desativar esta consulta temporariamente porque a tabela não existe
          /*
          const { data: respostasSimulados, error: simuladosError } = await supabase
            .from("respostas_simulados")
            .select("*")
            .eq("aluno_id", user.id)
            .order("created_at", { ascending: false });
          
          if (simuladosError) throw simuladosError;
          
          if (respostasSimulados && respostasSimulados.length > 0) {
            // Criar lista de IDs de simulados
            const simuladosIds = respostasSimulados.map(resposta => resposta.simulado_id);
            
            // Buscar simulados
            const { data: simuladosData, error: simuladosDataError } = await supabase
              .from("simulados")
              .select("*")
              .in("id", simuladosIds);
              
            if (simuladosDataError) throw simuladosDataError;
            
            // Criar um mapa para fácil acesso aos simulados
            const simuladosMap = new Map();
            if (simuladosData) {
              simuladosData.forEach(simulado => {
                simuladosMap.set(simulado.id, simulado);
              });
            }
            
            // Formatar os dados para a interface
            const formattedSimulados = respostasSimulados.map((resposta) => {
              const simulado = simuladosMap.get(resposta.simulado_id);
              return {
                id: resposta.simulado_id,
                titulo: simulado ? simulado.titulo : "Sem título",
                questoes_ids: simulado ? simulado.questoes_ids || [] : [],
                data_realizacao: format(new Date(resposta.created_at), "dd/MM/yyyy"),
                acertos: resposta.acertos,
                erros: resposta.erros,
                nota: resposta.nota,
              };
            });
            
            setSimulados(formattedSimulados);
          } else {
            setSimulados([]);
          }
          */
          
          // Definir simulados como uma lista vazia até que a tabela seja criada
          setSimulados([]);
          
        } catch (simuladoError) {
          console.error("Erro ao buscar simulados:", simuladoError);
          // Não interromper o fluxo principal se houver erro nos simulados
          setSimulados([]);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        toast.error("Erro ao carregar estatísticas. Tente novamente mais tarde.");
        
        // Inicializar dados vazios em caso de erro
        setDailyStats([]);
        setDisciplinasStats([]);
        setTotalStats({
          total: 0,
          acertos: 0,
          erros: 0,
          aproveitamento: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [user, periodo]);
  
  // Dados para o gráfico de rosca
  const pieChartData = [
    { name: "Erros", value: totalStats.erros },
    { name: "Acertos", value: totalStats.acertos },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 mx-auto w-full">
        <div className="container mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl font-bold text-[#262f3c]">Dashboard</h1>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Selecione o período:</span>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <Card className="p-8 flex justify-center items-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5f2ebe] mb-4"></div>
                  <p className="text-gray-500">Carregando estatísticas...</p>
                </div>
              </Card>
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Desempenho Geral</CardTitle>
                  <CardDescription>
                    Total de questões respondidas no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total de Resoluções</p>
                      <p className="text-2xl font-bold text-blue-600">{totalStats.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Resoluções Certas</p>
                      <p className="text-2xl font-bold text-green-600">{totalStats.acertos}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Resoluções Erradas</p>
                      <p className="text-2xl font-bold text-red-600">{totalStats.erros}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Taxa de Acerto</p>
                      <p className="text-2xl font-bold text-purple-600">{totalStats.aproveitamento}%</p>
                    </div>
                  </div>
                  
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={dailyStats}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'questoes') return [`${value}`, 'Resoluções'];
                            if (name === 'acertos') return [`${value}`, 'Acertos'];
                            return [value, name];
                          }}
                          labelFormatter={(label) => {
                            const item = dailyStats.find(stat => stat.date === label);
                            return item ? item.dia_formatado : label;
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="questoes" 
                          name="Resoluções" 
                          fill="#2563EB" 
                        />
                        <Bar 
                          dataKey="acertos" 
                          name="Acertos" 
                          fill="#10B981" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Percentual de rendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex justify-center items-center mt-4">
                    <div className="flex items-center mr-4">
                      <div className="w-4 h-4 bg-[#5f2ebe] mr-2"></div>
                      <span className="text-sm">Acertos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#FF8042] mr-2"></div>
                      <span className="text-sm">Erros</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <button 
                      className="flex items-center text-sm text-[#5f2ebe]"
                      onClick={() => {
                        setTotalStats({
                          total: 0,
                          acertos: 0,
                          erros: 0,
                          aproveitamento: 0,
                        });
                        setTimeout(() => setPeriodo(periodo), 100);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Zerar estatísticas
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Estatísticas por disciplina</CardTitle>
                  <CardDescription>
                    Desempenho detalhado por disciplina no período selecionado
                  </CardDescription>
                </div>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Disciplina</th>
                        <th className="py-2 text-center">Certas</th>
                        <th className="py-2 text-center">Erradas</th>
                        <th className="py-2 text-center">Em branco</th>
                        <th className="py-2 text-center">Total</th>
                        <th className="py-2 text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disciplinasStats.length > 0 ? (
                        disciplinasStats.map((disciplina, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{disciplina.disciplina}</td>
                            <td className="py-2 text-center">{disciplina.certas}</td>
                            <td className="py-2 text-center">{disciplina.erradas}</td>
                            <td className="py-2 text-center">{disciplina.em_branco}</td>
                            <td className="py-2 text-center">{disciplina.total}</td>
                            <td className="py-2 text-center">{disciplina.aproveitamento}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-500">
                            Nenhum dado disponível para o período selecionado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Últimos Simulados</CardTitle>
                  <CardDescription>
                    Simulados realizados recentemente
                  </CardDescription>
                </div>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="concluidos">Concluídos</SelectItem>
                    <SelectItem value="pendentes">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {simulados.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Simulado</th>
                          <th className="py-2 text-center">Data</th>
                          <th className="py-2 text-center">Questões</th>
                          <th className="py-2 text-center">Acertos</th>
                          <th className="py-2 text-center">Erros</th>
                          <th className="py-2 text-center">Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulados.map((simulado) => (
                          <tr key={simulado.id} className="border-b">
                            <td className="py-2">{simulado.titulo}</td>
                            <td className="py-2 text-center">{simulado.data_realizacao}</td>
                            <td className="py-2 text-center">{simulado.questoes_ids.length}</td>
                            <td className="py-2 text-center">{simulado.acertos}</td>
                            <td className="py-2 text-center">{simulado.erros}</td>
                            <td className="py-2 text-center">{simulado.nota.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <img
                        src="/lovable-uploads/no-data.svg"
                        alt="Nada por aqui"
                        className="w-32 h-32"
                      />
                    </div>
                    <p className="text-gray-500 mb-2">Nada por aqui</p>
                    <p className="text-gray-500 text-sm">
                      Não foram encontrados simulados para o filtro selecionado
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      (A funcionalidade de simulados será disponibilizada em breve)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard; 