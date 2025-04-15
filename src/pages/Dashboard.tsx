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
import { RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import React from "react";

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
  banca?: string;
  topicos?: TopicoStats[];
}

// Interface para estatísticas por tópico
interface TopicoStats {
  topico: string;
  certas: number;
  erradas: number;
  em_branco: number;
  total: number;
  aproveitamento: number;
  banca?: string;
}

// Interface para resultados de tópicos com banca
interface TopicoComBanca {
  topico: string;
  banca: string;
}

// Interface para simulados
interface Simulado {
  id: string;
  titulo: string;
  questoes_total: number;
  acertos: number;
  erros: number;
  aproveitamento: number;
  data_realizacao: string;
  realizado: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState("7");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [disciplinasStats, setDisciplinasStats] = useState<DisciplinaStats[]>([]);
  const [filteredDisciplinasStats, setFilteredDisciplinasStats] = useState<DisciplinaStats[]>([]);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [filteredSimulados, setFilteredSimulados] = useState<Simulado[]>([]);
  const [filtroSimulado, setFiltroSimulado] = useState("todos");
  const [bancas, setBancas] = useState<{ valor: string; exibicao: string }[]>([]);
  const [selectedBanca, setSelectedBanca] = useState<string>("todas");
  const [expandedDisciplinas, setExpandedDisciplinas] = useState<string[]>([]);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    acertos: 0,
    erros: 0,
    aproveitamento: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  // Criar um mapa para armazenar a relação entre disciplinas e bancas
  const [disciplinasBancasMap, setDisciplinasBancasMap] = useState<Map<string, Set<string>>>(new Map());

  const CORES = ["#FF8042", "#5f2ebe"];

  // Função para normalizar o nome da banca
  const normalizarBanca = (banca: string): string => {
    return banca.toLowerCase().trim();
  };
  
  // Função para normalizar o tópico
  const normalizarTopico = (topico: string): string => {
    // Remover pontuação e normalizar para minúsculas
    return topico
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ''); // Remove pontuação
  };

  // Função atualizada para extrair tópicos da resposta ou questão, incluindo informação da banca
  const extrairTopicos = (resposta: any, questao: any): TopicoComBanca[] => {
    let topicos: string[] = [];
    let bancaDoTopico = resposta.banca || questao.institution || "Sem banca";
    bancaDoTopico = normalizarBanca(bancaDoTopico);
    
    // Verificar se há tópicos na resposta
    if (resposta?.topicos) {
      // Pode ser um array ou uma string
      if (Array.isArray(resposta.topicos)) {
        topicos = resposta.topicos;
      } else {
        topicos = [resposta.topicos];
      }
    } 
    // Verificar se há tópicos na questão (versão em português)
    else if (questao?.topicos && questao.topicos.length > 0) {
      topicos = questao.topicos;
    } 
    // Verificar se há tópicos na questão (versão em inglês)
    else if (questao?.topics && questao.topics.length > 0) {
      topicos = questao.topics;
    }
    // Se não encontrou nenhum tópico
    else {
      topicos = ["Sem tópico"];
    }
    
    return topicos.map(topico => ({
      topico,
      banca: bancaDoTopico
    }));
  };

  // Função para agrupar tópicos duplicados
  const agruparTopicosDuplicados = (disciplinasComTopicos: DisciplinaStats[]): DisciplinaStats[] => {
    return disciplinasComTopicos.map((disciplina) => {
      const topicosMergeados = new Map<string, TopicoStats>();
      
      // Verificar se disciplina.topicos existe e não está vazio
      if (disciplina.topicos && disciplina.topicos.length > 0) {
        disciplina.topicos.forEach((tpc: TopicoStats) => {
          const topicoNormalizado = normalizarTopico(tpc.topico);
          
          if (topicosMergeados.has(topicoNormalizado)) {
            const topicoExistente = topicosMergeados.get(topicoNormalizado)!;
            topicoExistente.certas += tpc.certas;
            topicoExistente.erradas += tpc.erradas;
            topicoExistente.em_branco += tpc.em_branco;
            topicoExistente.total += tpc.total;
          } else {
            topicosMergeados.set(topicoNormalizado, {
              ...tpc,
              topico: topicoNormalizado,
            });
          }
        });
      }
      
      return {
        ...disciplina,
        topicos: Array.from(topicosMergeados.values()),
      };
    });
  };

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
          const topicosMap = new Map<string, Map<string, TopicoStats>>();
          const bancasSet = new Set<string>();
          
          // Novo mapa para rastrear bancas por disciplina
          const disciplinasBancasMap = new Map<string, Set<string>>();
          
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
              
              // Verificar se a resposta está correta usando is_correta
              if (resposta.is_correta) {
                diaStat.acertos += 1;
                totalAcertos += 1;
              } else {
                diaStat.erros += 1;
              }
              
              dailyStatsMap.set(dataResposta, diaStat);
              totalQuestoes += 1;
            }
            
            // Obter a banca da resposta ou da questão
            const banca = resposta.banca || questao.institution || "Sem banca";
            const bancaNormalizada = normalizarBanca(banca);
            bancasSet.add(bancaNormalizada);
            
            // Agrupar somente por disciplina (sem a banca na chave)
            const disciplina = questao.discipline || "Sem disciplina";
            
            // Rastrear bancas para cada disciplina
            if (!disciplinasBancasMap.has(disciplina)) {
              disciplinasBancasMap.set(disciplina, new Set([bancaNormalizada]));
            } else {
              disciplinasBancasMap.get(disciplina)!.add(bancaNormalizada);
            }
            
            if (!disciplinasMap.has(disciplina)) {
              disciplinasMap.set(disciplina, {
                disciplina,
                certas: 0,
                erradas: 0,
                em_branco: 0,
                total: 0,
                aproveitamento: 0,
                banca: bancaNormalizada, // Associar a banca à disciplina
                topicos: [],
              });
              
              // Inicializar o mapa de tópicos para esta disciplina
              topicosMap.set(disciplina, new Map<string, TopicoStats>());
            }
            
            // Obter tópicos da resposta ou questão (agora com informação de banca)
            const topicosComBanca = extrairTopicos(resposta, questao);
            const topicosMapDisciplina = topicosMap.get(disciplina)!;
            
            topicosComBanca.forEach(({ topico: tpc, banca: bancaTopico }: TopicoComBanca) => {
              if (!topicosMapDisciplina.has(tpc)) {
                topicosMapDisciplina.set(tpc, {
                  topico: tpc,
                  certas: 0,
                  erradas: 0,
                  em_branco: 0,
                  total: 0,
                  aproveitamento: 0,
                  banca: bancaTopico // Armazenar a banca do tópico
                });
              }
              
              const topicoStat = topicosMapDisciplina.get(tpc)!;
              
              // Incrementar total apenas uma vez por resposta na disciplina (já feito fora do loop)
              topicoStat.total += 1;
            
            if (resposta.opcao_id) {
                if (resposta.is_correta) {
                  // Acertos do tópico
                  topicoStat.certas += 1;
              } else {
                  // Erros do tópico
                  topicoStat.erradas += 1;
              }
            } else {
                // Em branco do tópico
                topicoStat.em_branco += 1;
              }
                                
              topicoStat.aproveitamento = 
                topicoStat.total > 0 
                  ? Math.round((topicoStat.certas / topicoStat.total) * 100) 
                  : 0;
              
              topicosMapDisciplina.set(tpc, topicoStat);
            });
            
            // Atualizar disciplina e mapa de tópicos
            topicosMap.set(disciplina, topicosMapDisciplina);
          });
          
          // Adicionar tópicos às disciplinas
          for (const [disciplina, disciplinaStat] of disciplinasMap.entries()) {
            const topicosDisc = topicosMap.get(disciplina);
            if (topicosDisc) {
              // Ordenar os tópicos alfabeticamente pelo nome do tópico
              disciplinaStat.topicos = Array.from(topicosDisc.values())
                .sort((a, b) => a.topico.localeCompare(b.topico)); // Ordenação alfabética por nome do tópico
              
              // Calcular totais da disciplina somando os valores dos tópicos
              disciplinaStat.certas = 0;
              disciplinaStat.erradas = 0;
              disciplinaStat.em_branco = 0;
              disciplinaStat.total = 0;
              
              disciplinaStat.topicos.forEach(topico => {
                disciplinaStat.certas += topico.certas;
                disciplinaStat.erradas += topico.erradas;
                disciplinaStat.em_branco += topico.em_branco;
                disciplinaStat.total += topico.total;
              });
              
              // Calcular aproveitamento da disciplina
              disciplinaStat.aproveitamento = 
                disciplinaStat.total > 0 
                  ? Math.round((disciplinaStat.certas / disciplinaStat.total) * 100) 
                  : 0;
              
              disciplinasMap.set(disciplina, disciplinaStat);
            }
          }
          
          // Função para agrupar tópicos com o mesmo nome dentro de cada disciplina
          const disciplinasComTopicoAgrupados = agruparTopicosDuplicados(Array.from(disciplinasMap.values()));
          
          // Calcular aproveitamento geral
          const aproveitamento = totalQuestoes > 0 
            ? Math.round((totalAcertos / totalQuestoes) * 100) 
            : 0;
          
          // Converter para array e ordenar por data
          const dailyStatsArray = Array.from(dailyStatsMap.values())
            .sort((a, b) => {
              const dateA = a.date.split('/').reverse().join('/');
              const dateB = b.date.split('/').reverse().join('/');
              return dateA.localeCompare(dateB);
            });
          
          const bancasArray = Array.from(bancasSet).sort();
          
          // Formatação das bancas para exibição na interface
          const bancasFormatadas = bancasArray.map(banca => {
            // Converter para minúsculas e depois capitalizar
            return {
              valor: banca, // Valor original (minúsculo) para comparação
              exibicao: banca.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) // Para exibição
            };
          });
          
          setDailyStats(dailyStatsArray);
          setDisciplinasStats(disciplinasComTopicoAgrupados);
          setFilteredDisciplinasStats(disciplinasComTopicoAgrupados);
          setBancas(bancasFormatadas);
          
          setTotalStats({
            total: totalQuestoes,
            acertos: totalAcertos,
            erros: totalQuestoes - totalAcertos,
            aproveitamento,
          });
          
          // Atualizar o estado com o mapa de bancas por disciplina
          setDisciplinasBancasMap(disciplinasBancasMap);
          
          // Reset da banca selecionada para "todas" quando os dados são carregados
          setSelectedBanca("todas");
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
          setFilteredDisciplinasStats([]);
          setBancas([]);
          setTotalStats({
            total: 0,
            acertos: 0,
            erros: 0,
            aproveitamento: 0,
          });
        }
        
        // Buscar simulados do aluno
        try {
          // Buscar resultados de simulados do usuário
          let { data: simuladosResults, error: simuladosError } = await supabase
            .from("user_simulado_results")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          // Se houver erro na primeira tabela, tentar a alternativa
          if (simuladosError) {
            console.log("Tentando tabela alternativa para simulados...", simuladosError.message);
            
            // Tentar com a tabela "simulado_results" (possível nome alternativo)
            const { data: altResults, error: altError } = await supabase
              .from("simulado_results")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });
            
            if (!altError) {
              simuladosResults = altResults;
              simuladosError = null;
              console.log("Usando tabela alternativa para simulados");
            } else {
              console.log("Tabela alternativa também não disponível:", altError.message);
            }
          }
          
          if (simuladosError) {
            // Se o erro persistir com ambas as tabelas
            console.log("Nenhuma tabela de resultados de simulados disponível");
            setSimulados([]);
            return;
          }
          
          if (!simuladosResults || simuladosResults.length === 0) {
            setSimulados([]);
            return;
          }
          
            // Criar lista de IDs de simulados
          const simuladosIds = Array.from(new Set(
            simuladosResults.map(result => result.simulado_id || "")
              .filter(id => id !== "")
          ));
          
          if (simuladosIds.length === 0) {
            setSimulados([]);
            return;
          }
          
          // Buscar detalhes dos simulados separadamente
            const { data: simuladosData, error: simuladosDataError } = await supabase
              .from("simulados")
              .select("*")
              .in("id", simuladosIds);
              
          if (simuladosDataError) {
            console.log("Erro ao buscar detalhes dos simulados:", simuladosDataError.message);
          }
          
          // Formatar os dados para a interface, mesmo se houver erro na busca de detalhes
          const formattedSimulados = simuladosResults.map((result) => {
            // Tentar encontrar o simulado correspondente
            const simulado = simuladosDataError ? null : 
              simuladosData?.find(s => s.id === result.simulado_id);
            
            // Obter valores com tratamento para diferentes estruturas de coluna
            const simuladoId = result.simulado_id || result.id;
            const correctAnswers = result.correct_answers || result.acertos || 0;
            const wrongAnswers = result.wrong_answers || result.erros || 0;
            const totalQuestions = result.total_questions || 
              (correctAnswers + wrongAnswers) || 0;
            
            const questoesTotais = simulado 
              ? (simulado.questoes_ids?.length || totalQuestions || 0) 
              : totalQuestions || 0;
            
              return {
              id: simuladoId,
              titulo: simulado ? simulado.titulo : `Simulado ${simuladoId.slice(0, 8)}...`,
              questoes_total: questoesTotais,
              acertos: correctAnswers,
              erros: wrongAnswers,
              aproveitamento: questoesTotais > 0 
                ? Math.round((correctAnswers / questoesTotais) * 100) 
                : 0,
              data_realizacao: format(new Date(result.created_at), "dd/MM/yyyy"),
              realizado: true
              };
            });
            
            setSimulados(formattedSimulados);
        } catch (simuladoError) {
          console.error("Erro ao buscar simulados:", simuladoError);
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
  
  // Aplicar filtro de banca quando selecionada
  useEffect(() => {
    if (!user) return;
    
    if (selectedBanca === "todas") {
      // Se todas as bancas estiverem selecionadas, usar as estatísticas gerais
      setFilteredDisciplinasStats(disciplinasStats);
      return;
    }
    
    // Se chegou aqui, significa que uma banca específica foi selecionada
    setIsLoading(true);
    
    try {
      // Usar a banca selecionada diretamente, sem normalização adicional
      const bancaSelecionada = selectedBanca;
      
      // Fazer uma cópia profunda das estatísticas para poder modificá-las
      const disciplinasParaFiltrar = JSON.parse(JSON.stringify(disciplinasStats));
      
      // Filtrar apenas as disciplinas que têm a banca selecionada
      const disciplinasFiltradas = disciplinasParaFiltrar.filter((disciplina: DisciplinaStats) => {
        // Verificar se a disciplina tem a banca diretamente
        if (disciplina.banca === bancaSelecionada) {
          return true;
        }
        
        // Verificar no mapa de bancas por disciplina
        const bancasDisciplina = disciplinasBancasMap.get(disciplina.disciplina);
        if (bancasDisciplina && bancasDisciplina.has(bancaSelecionada)) {
          return true;
        }
        
        return false;
      });
      
      // Para cada disciplina filtrada, incluir apenas os tópicos relevantes e recalcular os totais
      disciplinasFiltradas.forEach((disciplina: DisciplinaStats) => {
        // Filtrar tópicos que pertencem à banca selecionada
        if (disciplina.topicos) {
          // Passo 1: Filtrar os tópicos apenas para a banca selecionada
          const topicosFiltrados = disciplina.topicos.filter((topico: TopicoStats) => 
            // Verificar pela propriedade banca ou tentar pelo mapa de bancas-tópicos
            topico.banca === bancaSelecionada || 
            // Assumir que o tópico pertence à banca se a informação não estiver disponível
            !topico.banca
          );
          
          // Passo 2: Substituir a lista original de tópicos pela filtrada e ordenar alfabeticamente
          disciplina.topicos = topicosFiltrados.sort((a, b) => a.topico.localeCompare(b.topico));
          
          // Passo 3: Recalcular os totais da disciplina baseado apenas nos tópicos filtrados
          disciplina.certas = 0;
          disciplina.erradas = 0;
          disciplina.em_branco = 0;
          disciplina.total = 0;
          
          topicosFiltrados.forEach((topico: TopicoStats) => {
            disciplina.certas += topico.certas;
            disciplina.erradas += topico.erradas;
            disciplina.em_branco += topico.em_branco;
            disciplina.total += topico.total;
          });
          
          // Recalcular o aproveitamento
          disciplina.aproveitamento = 
            disciplina.total > 0 
              ? Math.round((disciplina.certas / disciplina.total) * 100) 
              : 0;
        }
      });
      
      if (disciplinasFiltradas.length > 0) {
        // Força a atualização do estado para garantir a rerenderização
        setFilteredDisciplinasStats([]);
        
        // Pequeno timeout para garantir que o React processe o estado vazio primeiro
        setTimeout(() => {
          setFilteredDisciplinasStats(disciplinasFiltradas);
        }, 10);
      } else {
        // Se não houver disciplinas para a banca selecionada, mostrar lista vazia
        setFilteredDisciplinasStats([]);
      }
    } catch (error) {
      console.error("Erro ao filtrar estatísticas por banca:", error);
      toast.error("Erro ao filtrar estatísticas por banca.");
      setFilteredDisciplinasStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBanca, disciplinasStats, user, disciplinasBancasMap]);
  
  // Inicializar simulados filtrados quando os simulados mudarem
  useEffect(() => {
    setFilteredSimulados(simulados);
  }, [simulados]);
  
  // Filtrar simulados baseado no filtro selecionado
  useEffect(() => {
    if (filtroSimulado === "todos") {
      setFilteredSimulados(simulados);
    } else if (filtroSimulado === "concluidos") {
      setFilteredSimulados(simulados.filter(simulado => simulado.realizado));
    } else if (filtroSimulado === "pendentes") {
      setFilteredSimulados(simulados.filter(simulado => !simulado.realizado));
    }
  }, [filtroSimulado, simulados]);
  
  // Dados para o gráfico de rosca
  const pieChartData = [
    { name: "Erros", value: totalStats.erros },
    { name: "Acertos", value: totalStats.acertos },
  ];

  // Função para alternar a expansão de uma disciplina
  const toggleDisciplina = (disciplina: string) => {
    setExpandedDisciplinas(prev => 
      prev.includes(disciplina)
        ? prev.filter(d => d !== disciplina)
        : [...prev, disciplina]
    );
  };

  // Certificar-se de que o valor da banca selecionada está sendo aplicado corretamente
  useEffect(() => {
    // Limpar qualquer log de debug
  }, [selectedBanca]);

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-grow px-4 py-6 md:px-8 max-w-7xl w-full mx-auto pt-8">
        <div className="w-full">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl text-[#272f3c] font-extrabold md:text-3xl mb-2">Dashboard</h1>
              
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
              <div className="flex items-center justify-center my-20">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5f2ebe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
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
                            if (item) {
                              // Calcular o aproveitamento do dia
                              const aproveitamento = item.questoes > 0 
                                ? Math.round((item.acertos / item.questoes) * 100) 
                                : 0;
                              return `${item.dia_formatado}\nAproveitamento: ${aproveitamento}%`;
                            }
                            return label;
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
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <CardTitle>Estatísticas por disciplina</CardTitle>
                  <CardDescription className="whitespace-nowrap">
                    Desempenho detalhado por disciplina {selectedBanca !== "todas" && `(Banca: ${
                      typeof selectedBanca === 'string' 
                        ? selectedBanca.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                        : selectedBanca
                    })`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto sm:ml-auto">
                  <Select value={selectedBanca} onValueChange={setSelectedBanca}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por banca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as bancas</SelectItem>
                      {bancas.map((banca) => (
                        <SelectItem key={banca.valor} value={banca.valor}>
                          {banca.exibicao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      {filteredDisciplinasStats.length > 0 ? (
                        filteredDisciplinasStats.map((disciplina, index) => (
                          <React.Fragment key={`disciplina-${disciplina.disciplina}-${index}`}>
                            <tr 
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleDisciplina(disciplina.disciplina)}
                            >
                              <td className="py-2 flex items-center">
                                <span className="mr-2 text-gray-500 inline-flex items-center justify-center w-5 h-5">
                                  {expandedDisciplinas.includes(disciplina.disciplina) 
                                    ? <ChevronDown size={16} /> 
                                    : <ChevronRight size={16} />}
                                </span>
                                <span className="font-medium">{disciplina.disciplina}</span>
                                {selectedBanca !== "todas" && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    Filtrado por banca
                                  </span>
                                )}
                              </td>
                            <td className="py-2 text-center">{disciplina.certas}</td>
                            <td className="py-2 text-center">{disciplina.erradas}</td>
                            <td className="py-2 text-center">{disciplina.em_branco}</td>
                            <td className="py-2 text-center">{disciplina.total}</td>
                              <td className="py-2 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                                    <div 
                                      className={`h-1.5 rounded-full ${
                                        disciplina.aproveitamento >= 70 ? 'bg-green-500' : 
                                        disciplina.aproveitamento >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${disciplina.aproveitamento}%` }}
                                    ></div>
                                  </div>
                                  <span>{disciplina.aproveitamento}%</span>
                                </div>
                              </td>
                            </tr>
                            {/* Tópicos expandidos */}
                            {expandedDisciplinas.includes(disciplina.disciplina) && (
                              <>
                                {disciplina.topicos && disciplina.topicos.length > 0 ? (
                                  disciplina.topicos.map((topico, topicoIndex) => (
                                    <tr 
                                      key={`topico-${disciplina.disciplina}-${topicoIndex}`} 
                                      className="bg-gray-50 text-sm border-b border-gray-100"
                                    >
                                      <td className="py-2 pl-10 text-gray-700">
                                        {topico.topico}
                                        {selectedBanca !== "todas" && (
                                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                                            {selectedBanca}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 text-center text-gray-700">{topico.certas}</td>
                                      <td className="py-2 text-center text-gray-700">{topico.erradas}</td>
                                      <td className="py-2 text-center text-gray-700">{topico.em_branco}</td>
                                      <td className="py-2 text-center text-gray-700">{topico.total}</td>
                                      <td className="py-2 text-center text-gray-700">
                                        <div className="flex items-center justify-center">
                                          <div className="w-12 bg-gray-200 rounded-full h-1 mr-2">
                                            <div 
                                              className={`h-1 rounded-full ${
                                                topico.aproveitamento >= 70 ? 'bg-green-500' : 
                                                topico.aproveitamento >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${topico.aproveitamento}%` }}
                                            ></div>
                                          </div>
                                          <span>{topico.aproveitamento}%</span>
                                        </div>
                                      </td>
                          </tr>
                                  ))
                                ) : (
                                  <tr className="bg-gray-50 text-sm border-b border-gray-100">
                                    <td colSpan={6} className="py-3 text-center text-gray-500">
                                      Nenhum tópico encontrado para esta disciplina
                                    </td>
                                  </tr>
                                )}
                              </>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-500">
                            {selectedBanca !== "todas" 
                              ? `Nenhuma questão respondida da banca ${selectedBanca} no período selecionado`
                              : "Nenhum dado disponível para o período selecionado"
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <CardTitle>Simulados</CardTitle>
                  <CardDescription className="whitespace-nowrap">
                    Resultados dos simulados realizados
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto sm:ml-auto">
                  <Select value={filtroSimulado} onValueChange={setFiltroSimulado}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar simulados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os simulados</SelectItem>
                      <SelectItem value="concluidos">Concluídos</SelectItem>
                      <SelectItem value="pendentes">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSimulados.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Simulado</th>
                          <th className="py-2 text-center">Questões</th>
                          <th className="py-2 text-center">Acertos</th>
                          <th className="py-2 text-center">Erros</th>
                          <th className="py-2 text-center">Aproveitamento</th>
                          <th className="py-2 text-center">Realizado</th>
                          <th className="py-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSimulados.map((simulado) => (
                          <tr key={simulado.id} className="border-b">
                            <td className="py-2">{simulado.titulo}</td>
                            <td className="py-2 text-center">{simulado.questoes_total}</td>
                            <td className="py-2 text-center">{simulado.acertos}</td>
                            <td className="py-2 text-center">{simulado.erros}</td>
                            <td className="py-2 text-center">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${simulado.aproveitamento}%` }}
                                  ></div>
                                </div>
                                <span>{simulado.aproveitamento}%</span>
                              </div>
                            </td>
                            <td className="py-2 text-center">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {simulado.realizado ? "Sim" : "Não"}
                              </span>
                            </td>
                            <td className="py-2 text-center">
                              <a 
                                href={`/simulado/${simulado.id}/refazer`} 
                                className="text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-md text-sm font-medium"
                              >
                                Refazer
                              </a>
                            </td>
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