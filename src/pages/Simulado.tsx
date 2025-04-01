import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { QuestionItemType } from "@/components/admin/questions/types";
import { Json } from "@/integrations/supabase/types";
import { QuestionCard } from "@/components/new/QuestionCard";
import { Question } from "@/components/new/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

// Opções de exibição de questões
type DisplayOption = "single" | "ten" | "all";

// Definição dos tipos para as tabelas do Supabase
interface UserSimuladoResult {
  id?: string;
  user_id: string;
  simulado_id: string;
  acertos: number;
  erros: number;
  created_at?: string;
  updated_at?: string;
}

interface RespostaAluno {
  id: string;
  aluno_id: string;
  questao_id: string;
  opcao_id: string;
  is_correta: boolean;
  created_at?: string;
}

interface RespostaAluno {
  questao_id: string;
  is_correta: boolean;
  created_at?: string;
}

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

const Simulado = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const navigate = useNavigate();
  const [simulado, setSimulado] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItemType[]>([]);
  const [formattedQuestions, setFormattedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [disabledOptions, setDisabledOptions] = useState<Record<string, string[]>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isFinishingSimulado, setIsFinishingSimulado] = useState(false);
  
  // Estado para controlar a exibição das questões
  const [displayOption, setDisplayOption] = useState<DisplayOption>("single");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [searchParams] = useSearchParams();
  
  // Calcular o número de páginas com base na opção de exibição
  const getPageCount = () => {
    if (displayOption === "all") return 1;
    if (displayOption === "ten") return Math.ceil(formattedQuestions.length / 10);
    return formattedQuestions.length;
  };
  
  // Obter as questões a serem exibidas na página atual
  const getDisplayedQuestions = () => {
    if (displayOption === "all") return formattedQuestions;
    if (displayOption === "ten") {
      const startIndex = (currentPage - 1) * 10;
      return formattedQuestions.slice(startIndex, startIndex + 10);
    }
    return [formattedQuestions[activeQuestion]];
  };

  useEffect(() => {
    const fetchSimulado = async () => {
      try {
        setIsLoading(true);

        // Buscar dados do simulado
        const { data: simuladoData, error: simuladoError } = await supabase
          .from("simulados")
          .select("*")
          .eq("id", simuladoId)
          .single();

        if (simuladoError) throw simuladoError;
        if (!simuladoData) {
          toast.error("Simulado não encontrado");
          return;
        }

        setSimulado(simuladoData);

        // Buscar as questões do simulado
        if (simuladoData.questoes_ids && simuladoData.questoes_ids.length > 0) {
          const { data: questionsData, error: questionsError } = await supabase
            .from("questoes")
            .select("*")
            .in("id", simuladoData.questoes_ids);

          if (questionsError) throw questionsError;

          // Formatar os dados das questões
          const formattedQuestionsAdmin: QuestionItemType[] = questionsData.map((q: any) => ({
            id: q.id,
            year: q.year,
            institution: q.institution,
            organization: q.organization,
            role: q.role,
            discipline: q.discipline,
            level: q.level,
            difficulty: q.difficulty,
            questionType: q.questiontype,
            content: q.content,
            teacherExplanation: q.teacherexplanation,
            aiExplanation: q.aiexplanation || "",
            expandableContent: q.expandablecontent || "",
            options: parseOptions(q.options),
            topicos: Array.isArray(q.topicos) ? q.topicos : []
          }));

          setQuestions(formattedQuestionsAdmin);
          
          // Formatar questões para o formato do QuestionCard
          const questionsForCard: Question[] = questionsData.map((q: any) => ({
            id: q.id,
            number: q.number || 0,
            content: q.content,
            command: q.command || '',
            options: parseOptions(q.options),
            year: q.year,
            institution: q.institution,
            organization: q.organization,
            role: q.role,
            educationLevel: q.education_level,
            discipline: q.discipline,
            topics: Array.isArray(q.topics) ? q.topics : [],
            expandableContent: q.expandablecontent || undefined,
            teacherExplanation: q.teacherexplanation || undefined,
            aiExplanation: q.aiexplanation || undefined,
            comments: []
          }));
          
          setFormattedQuestions(questionsForCard);
        }

        // Buscar respostas do usuário para este simulado
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (!userError && userData.user) {
          const { data: respostasData, error: respostasError } = await supabase
            .from("respostas_alunos")
            .select("questao_id, opcao_id")
            .eq("aluno_id", userData.user.id)
            .in("questao_id", simuladoData.questoes_ids || []);

          if (!respostasError && respostasData) {
            // Criar um objeto com as respostas do usuário
            const userAnswersObj: Record<string, string> = {};
            respostasData.forEach(resposta => {
              userAnswersObj[resposta.questao_id] = resposta.opcao_id;
            });
            setUserAnswers(userAnswersObj);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar simulado:", error);
        toast.error("Erro ao carregar o simulado. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimulado();
  }, [simuladoId]);

  useEffect(() => {
    fetchQuestions();
  }, [searchParams]);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para fazer o simulado');
        return;
      }

      const caderno = searchParams.get('caderno');
      let questionsQuery;

      if (caderno) {
        // Verifica se o usuário tem acesso ao caderno
        const { data: bookData, error: bookError } = await supabase
          .from('cadernos_questoes')
          .select('*')
          .eq('id', caderno)
          .single();

        if (bookError) throw bookError;

        if (bookData.user_id !== user.id && !bookData.is_public) {
          toast.error('Você não tem permissão para ver este caderno');
          return;
        }

        // Busca as questões do caderno
        questionsQuery = supabase
          .from('questoes_caderno')
          .select(`
            questao:questao_id (
              id,
              number,
              content,
              command,
              options,
              year,
              institution,
              organization,
              role,
              education_level,
              discipline,
              topics,
              expandable_content,
              teacher_explanation,
              ai_explanation
            )
          `)
          .eq('caderno_id', caderno);
      } else {
        // Busca questões aleatórias
        questionsQuery = supabase
          .from('questoes')
          .select('*')
          .limit(10);
      }

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) throw questionsError;

      const processedQuestions = caderno
        ? ((questionsData as unknown) as Array<{
            questao: {
              id: string;
              number: number;
              content: string;
              command: string;
              options: Array<{
                id: string;
                text: string;
                isCorrect: boolean;
              }>;
              year?: string;
              institution?: string;
              organization?: string;
              role?: string;
              education_level?: string;
              discipline?: string;
              topics?: string[];
              expandable_content?: string;
              teacher_explanation?: string;
              ai_explanation?: string;
            } | null;
          }>)
            .map(q => q.questao)
            .filter((q): q is NonNullable<{
              id: string;
              number: number;
              content: string;
              command: string;
              options: Array<{
                id: string;
                text: string;
                isCorrect: boolean;
              }>;
              year?: string;
              institution?: string;
              organization?: string;
              role?: string;
              education_level?: string;
              discipline?: string;
              topics?: string[];
              expandable_content?: string;
              teacher_explanation?: string;
              ai_explanation?: string;
            }> => Boolean(q))
            .map(q => ({
              id: q.id,
              number: q.number,
              content: q.content,
              command: q.command,
              options: q.options,
              year: q.year,
              institution: q.institution,
              organization: q.organization,
              role: q.role,
              educationLevel: q.education_level,
              discipline: q.discipline,
              topics: q.topics,
              expandableContent: q.expandable_content,
              teacherExplanation: q.teacher_explanation,
              aiExplanation: q.ai_explanation,
              comments: []
            } as Question))
        : questionsData;

      setQuestions(processedQuestions || []);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      toast.error('Erro ao carregar as questões');
    }
  };

  // Função para calcular e salvar os resultados do simulado
  const calculateAndSaveResults = async () => {
    try {
      setIsFinishingSimulado(true);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        toast.error("Você precisa estar logado para salvar os resultados.");
        return;
      }

      // Buscar todas as respostas do usuário para este simulado
      const { data: respostasData, error: respostasError } = await supabase
        .from("respostas_alunos")
        .select("questao_id, is_correta, created_at")
        .eq("aluno_id", userData.user.id)
        .in("questao_id", formattedQuestions.map(q => q.id))
        .order('created_at', { ascending: false });

      if (respostasError) {
        console.error("Erro ao buscar respostas:", respostasError);
        toast.error("Erro ao buscar suas respostas. Tente novamente.");
        return;
      }

      // Processar as respostas para garantir que apenas a última resposta de cada questão seja contabilizada
      const questoesMap = new Map<string, boolean>();
      
      if (respostasData && respostasData.length > 0) {
        // Usar apenas a primeira resposta (mais recente) de cada questão
        respostasData.forEach(resposta => {
          if (!questoesMap.has(resposta.questao_id)) {
            questoesMap.set(resposta.questao_id, resposta.is_correta);
          }
        });
      }

      // Calcular acertos e erros com base nas respostas mais recentes
      let acertos = 0;
      let erros = 0;

      questoesMap.forEach((isCorreta) => {
        if (isCorreta) {
          acertos++;
        } else {
          erros++;
        }
      });

      console.log("Salvando resultados:", {
        user_id: userData.user.id,
        simulado_id: simuladoId,
        acertos,
        erros,
        questoes_respondidas: questoesMap.size
      });

      // Usar o método upsert diretamente para simplificar o código
      // Usando type assertion para evitar erros de TypeScript
      const supabaseWithCustomTables = supabase as SupabaseClientWithCustomTables;
      const { error: upsertError } = await supabaseWithCustomTables
        .from("user_simulado_results")
        .upsert([{
          user_id: userData.user.id,
          simulado_id: simuladoId,
          acertos: acertos,
          erros: erros,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'user_id,simulado_id'
        });

      if (upsertError) {
        console.error("Erro ao salvar resultados:", upsertError);
        toast.error("Erro ao salvar resultados. Tente novamente.");
        return;
      }

      toast.success("Simulado finalizado com sucesso!");
      
      // Redirecionar para a página do curso
      const courseId = simulado.curso_id;
      if (courseId) {
        navigate(`/course/${courseId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao finalizar simulado:", error);
      toast.error("Erro ao finalizar simulado. Tente novamente.");
    } finally {
      setIsFinishingSimulado(false);
    }
  };

  const parseOptions = (options: Json | null) => {
    if (!options) return [];
    
    if (Array.isArray(options)) {
      return options.map((option: any) => ({
        id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect)
      }));
    }
    
    return [];
  };

  const handleNextQuestion = () => {
    if (activeQuestion < formattedQuestions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      
      // Atualizar a página atual se estiver no modo de exibição única
      if (displayOption === "single") {
        setCurrentPage(activeQuestion + 2);
      }
      
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
      
      // Atualizar a página atual se estiver no modo de exibição única
      if (displayOption === "single") {
        setCurrentPage(activeQuestion);
      }
      
      window.scrollTo(0, 0);
    }
  };

  // Função para lidar com a mudança na opção de exibição
  const handleDisplayOptionChange = (value: string) => {
    const option = value as DisplayOption;
    setDisplayOption(option);
    
    // Resetar a página atual ao mudar o modo de exibição
    setCurrentPage(1);
    
    // Se mudar para exibição única, sincronizar com a questão ativa
    if (option === "single") {
      setCurrentPage(activeQuestion + 1);
    }
  };
  
  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Se estiver no modo de exibição única, atualizar a questão ativa
    if (displayOption === "single") {
      setActiveQuestion(page - 1);
    }
    
    window.scrollTo(0, 0);
  };

  // Verificar se o usuário respondeu todas as questões
  const allQuestionsAnswered = formattedQuestions.length > 0 && 
    formattedQuestions.every(q => userAnswers[q.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-[88px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#272f3c] mb-4">Carregando simulado...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!simulado) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-[88px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#272f3c] mb-4">Simulado não encontrado</h1>
            <p className="text-[#67748a]">O simulado solicitado não existe ou não está disponível.</p>
            <Link to="/">
              <Button className="mt-4">Voltar para o início</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayedQuestions = getDisplayedQuestions();
  const pageCount = getPageCount();
  const currentQuestion = formattedQuestions[activeQuestion];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[88px] bg-[#f6f8fa]">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#272f3c] mb-2">{simulado.titulo}</h1>
                <div className="text-[#67748a] mb-4">
                  <p>Total de questões: {formattedQuestions.length}</p>
                  {simulado.data_inicio && (
                    <p>Disponível de: {new Date(simulado.data_inicio).toLocaleDateString('pt-BR')}</p>
                  )}
                  {simulado.data_fim && (
                    <p>Até: {new Date(simulado.data_fim).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#67748a] whitespace-nowrap">Exibir questões:</span>
                  <Select
                    value={displayOption}
                    onValueChange={handleDisplayOptionChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">1 por página</SelectItem>
                      <SelectItem value="ten">10 por página</SelectItem>
                      <SelectItem value="all">Todas de uma vez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f6f8fa] p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#67748a]">Progresso:</span>
                <span className="text-[#5f2ebe] font-semibold">
                  {displayOption === "single" ? `${activeQuestion + 1} de ${formattedQuestions.length}` : 
                   displayOption === "ten" ? `Página ${currentPage} de ${pageCount}` : 
                   `Todas as ${formattedQuestions.length} questões`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#5f2ebe] h-2.5 rounded-full" 
                  style={{ 
                    width: displayOption === "single" 
                      ? `${((activeQuestion + 1) / formattedQuestions.length) * 100}%`
                      : displayOption === "ten"
                      ? `${(currentPage / pageCount) * 100}%`
                      : "100%" 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {formattedQuestions.length > 0 ? (
            <div className="mb-8">
              {displayedQuestions.map((question, index) => (
                <div key={`question-${question.id}-${index}`} className="mb-8">
                  {displayOption !== "single" && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                      <h2 className="text-lg font-semibold text-[#272f3c]">
                        Questão {displayOption === "ten" ? (currentPage - 1) * 10 + index + 1 : index + 1} de {formattedQuestions.length}
                      </h2>
                    </div>
                  )}
                  
                  <QuestionCard 
                    question={question}
                    disabledOptions={disabledOptions[question.id] || []}
                    onToggleDisabled={(optionId, event) => {
                      event.preventDefault();
                      
                      setDisabledOptions(prev => {
                        const questionDisabledOptions = prev[question.id] || [];
                        
                        return {
                          ...prev,
                          [question.id]: questionDisabledOptions.includes(optionId)
                            ? questionDisabledOptions.filter(id => id !== optionId)
                            : [...questionDisabledOptions, optionId]
                        };
                      });

                      // Atualizar o estado de userAnswers quando o usuário seleciona uma opção
                      setUserAnswers(prev => ({
                        ...prev,
                        [question.id]: optionId
                      }));
                    }}
                  />
                </div>
              ))}
              
              {/* Paginação para modo de exibição "ten" */}
              {displayOption === "ten" && pageCount > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pageCount}
                    onPageChange={handlePageChange}
                    itemsPerPage={10}
                    totalItems={formattedQuestions.length}
                  />
                </div>
              )}
              
              {/* Navegação para modo de exibição "single" */}
              {displayOption === "single" && (
                <div className="flex justify-between mt-8">
                  <Button 
                    onClick={handlePreviousQuestion}
                    disabled={activeQuestion === 0}
                    variant="secondary"
                  >
                    Questão Anterior
                  </Button>
                  
                  {activeQuestion === formattedQuestions.length - 1 ? (
                    <Button 
                      onClick={calculateAndSaveResults}
                      disabled={isFinishingSimulado}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isFinishingSimulado ? "Finalizando..." : "Finalizar Simulado"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={activeQuestion === formattedQuestions.length - 1}
                    >
                      Próxima Questão
                    </Button>
                  )}
                </div>
              )}
              
              {/* Botão de finalizar para modos "ten" e "all" */}
              {(displayOption === "ten" || displayOption === "all") && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={calculateAndSaveResults}
                    disabled={isFinishingSimulado}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isFinishingSimulado ? "Finalizando..." : "Finalizar Simulado"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
              <p className="text-[#67748a]">Este simulado não possui questões.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Simulado;
