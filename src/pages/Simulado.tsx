import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
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
import { usePermissions } from "@/hooks/usePermissions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";
import { ActivityLogger } from "@/services/activity-logger";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { PublicLayout } from "@/components/layout/PublicLayout";

// Opções de exibição de questões
type DisplayOption = "single" | "ten" | "all";

// Tipo para o Supabase Client estendido
type SupabaseClientWithCustomTables = typeof supabase & {
  from(table: 'user_simulado_results'): any;
};

const Simulado = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const navigate = useNavigate();
  const [simulado, setSimulado] = useState<any>(null);
  const [formattedQuestions, setFormattedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [disabledOptions, setDisabledOptions] = useState<Record<string, string[]>>({});
  const [_userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isFinishingSimulado, setIsFinishingSimulado] = useState(false);
  
  // Estado para ranking
  const [rankingIsPublic, setRankingIsPublic] = useState(false);
  const [savingRankingVisibility, setSavingRankingVisibility] = useState(false);
  
  // Estado para controlar a exibição das questões
  const [displayOption, setDisplayOption] = useState<DisplayOption>("single");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [searchParams] = useSearchParams();
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  
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
          .select("*, ranking_is_public")
          .eq("id", simuladoId)
          .single();

        if (simuladoError) throw simuladoError;
        if (!simuladoData) {
          toast.error("Simulado não encontrado");
          return;
        }

        setSimulado(simuladoData);
        setRankingIsPublic(simuladoData.ranking_is_public || false);

        // Buscar as questões do simulado
        if (simuladoData.questoes_ids && simuladoData.questoes_ids.length > 0) {
          const { data: questionsData, error: questionsError } = await supabase
            .from("questoes")
            .select("*")
            .in("id", simuladoData.questoes_ids);

          if (questionsError) throw questionsError;

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
    // Só buscar questões adicionais se houver parâmetro caderno
    const caderno = searchParams.get('caderno');
    if (caderno) {
      fetchQuestions();
    }
  }, [searchParams]);

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para fazer o simulado');
        return;
      }

      const caderno = searchParams.get('caderno');
      
      // Não fazer nada se não houver caderno (questões do simulado já foram carregadas)
      if (!caderno) return;

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
      const questionsQuery = supabase
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
            expandablecontent,
            teacherexplanation,
            aiexplanation
          )
        `)
        .eq('caderno_id', caderno)
        .order('position', { ascending: true });

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) throw questionsError;

      // Formatar questões para o formato do QuestionCard
      const questionsForCard: Question[] = questionsData.map((qc: any) => {
        const q = qc.questao;
        return {
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
        };
      });

      setFormattedQuestions(questionsForCard);
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      toast.error("Erro ao carregar as questões. Tente novamente.");
    }
  };

  // Função para converter options do banco para o formato esperado
  const parseOptions = (options: Json | null): any[] => {
    if (!options) return [];
    
    // Verificar se options é um array
    if (Array.isArray(options)) {
      return options.map((option: any) => ({
        id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect)
      }));
    }
    
    return [];
  };

  const handleOptionSelect = async (questionId: string, optionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para responder às questões');
        return;
      }

      // Salvar resposta no banco de dados
      const { error } = await supabase
        .from('respostas_alunos')
        .upsert({
          aluno_id: user.id,
          questao_id: questionId,
          opcao_id: optionId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'aluno_id,questao_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: optionId
      }));

      // Log da atividade
      await ActivityLogger.logActivity('question_answered', {
        questionId,
        optionId,
        simuladoId
      });
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      toast.error("Erro ao salvar resposta. Tente novamente.");
    }
  };

  const handleToggleDisabled = (questionId: string, optionId: string) => {
    setDisabledOptions(prev => {
      const questionDisabled = prev[questionId] || [];
      const isDisabled = questionDisabled.includes(optionId);
      
      return {
        ...prev,
        [questionId]: isDisabled
          ? questionDisabled.filter(id => id !== optionId)
          : [...questionDisabled, optionId]
      };
    });
  };

  const handlePreviousQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestion < formattedQuestions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
    }
  };

  const handleQuestionChange = (index: number) => {
    if (index >= 0 && index < formattedQuestions.length) {
      setActiveQuestion(index);
    }
  };

  const calculateAndSaveResults = async () => {
    try {
      setIsFinishingSimulado(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para finalizar o simulado');
        return;
      }

      // Buscar todas as respostas do usuário para este simulado
      const { data: respostasData, error: respostasError } = await supabase
        .from("respostas_alunos")
        .select("questao_id, opcao_id")
        .eq("aluno_id", user.id)
        .in("questao_id", simulado.questoes_ids || []);

      if (respostasError) throw respostasError;

      // Criar um mapa de respostas para fácil acesso
      const userAnswersMap: Record<string, string> = {};
      respostasData.forEach(resposta => {
        userAnswersMap[resposta.questao_id] = resposta.opcao_id;
      });

      // Buscar as questões novamente para verificar as respostas corretas
      const { data: questionsData, error: questionsError } = await supabase
        .from("questoes")
        .select("id, options")
        .in("id", simulado.questoes_ids || []);

      if (questionsError) throw questionsError;

      // Calcular acertos
      let correctAnswers = 0;
      questionsData.forEach((q: any) => {
        const userAnswer = userAnswersMap[q.id];
        if (userAnswer) {
          const options = parseOptions(q.options);
          const correctOption = options.find((opt: any) => opt.isCorrect);
          if (correctOption && correctOption.id === userAnswer) {
            correctAnswers++;
          }
        }
      });

      // Calcular porcentagem
      const totalQuestions = simulado.questoes_ids?.length || 0;
      const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      // Salvar resultado no banco de dados
      const { error: resultError } = await supabase
        .from('user_simulado_results')
        .upsert({
          user_id: user.id,
          simulado_id: simuladoId,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          percentage: percentage,
          finished_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,simulado_id'
        });

      if (resultError) throw resultError;

      // Log da atividade
      await ActivityLogger.logActivity('simulado_completed', {
        simuladoId,
        correctAnswers,
        totalQuestions,
        percentage
      });

      toast.success(`Simulado finalizado! Você acertou ${correctAnswers} de ${totalQuestions} questões (${percentage}%).`);
      
      // Redirecionar para a página de ranking
      navigate(`/simulado-ranking/${simuladoId}`);
    } catch (error) {
      console.error("Erro ao calcular e salvar resultados:", error);
      toast.error("Erro ao finalizar simulado. Tente novamente.");
    } finally {
      setIsFinishingSimulado(false);
    }
  };

  const toggleRankingVisibility = async () => {
    try {
      setSavingRankingVisibility(true);
      
      const { error } = await supabase
        .from('simulados')
        .update({ 
          ranking_is_public: !rankingIsPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', simuladoId);

      if (error) throw error;

      setRankingIsPublic(!rankingIsPublic);
      toast.success(`Visibilidade do ranking ${!rankingIsPublic ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar visibilidade do ranking:", error);
      toast.error("Erro ao atualizar visibilidade do ranking. Tente novamente.");
    } finally {
      setSavingRankingVisibility(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5f2ebe]"></div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  if (!simulado) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Simulado não encontrado</h1>
              <p className="text-gray-600 mb-6">O simulado que você está tentando acessar não existe ou foi removido.</p>
              <Link to="/simulados">
                <Button>Voltar para simulados</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Cabeçalho do simulado */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{simulado.title}</h1>
                <p className="text-gray-600 mt-2">{simulado.description}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ranking-visibility"
                      checked={rankingIsPublic}
                      onCheckedChange={toggleRankingVisibility}
                      disabled={savingRankingVisibility}
                    />
                    <Label htmlFor="ranking-visibility">
                      {savingRankingVisibility ? "Salvando..." : "Ranking público"}
                    </Label>
                  </div>
                )}
                
                <Link to={`/simulado-ranking/${simuladoId}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Ver Ranking
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total de Questões</p>
                <p className="text-2xl font-bold text-[#5f2ebe]">{formattedQuestions.length}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tempo Estimado</p>
                <p className="text-2xl font-bold text-[#5f2ebe]">{formattedQuestions.length * 2} min</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Instituição</p>
                <p className="text-lg font-semibold text-gray-900">{simulado.institution || "Não especificada"}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Ano</p>
                <p className="text-lg font-semibold text-gray-900">{simulado.year || "Não especificado"}</p>
              </div>
            </div>
          </div>

          {/* Controles de navegação e exibição */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Modo de Exibição</p>
                  <Select value={displayOption} onValueChange={(value: DisplayOption) => {
                    setDisplayOption(value);
                    setCurrentPage(1);
                    setActiveQuestion(0);
                  }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Uma por vez</SelectItem>
                      <SelectItem value="ten">Dez por página</SelectItem>
                      <SelectItem value="all">Todas de uma vez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {displayOption !== "single" && (
                  <div>
                    <p className="text-sm text-gray-600">Página</p>
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={getPageCount()}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
              
              {displayOption === "single" && formattedQuestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handlePreviousQuestion}
                    disabled={activeQuestion === 0}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Questão {activeQuestion + 1} de {formattedQuestions.length}
                  </span>
                  
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={activeQuestion === formattedQuestions.length - 1}
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Lista de questões */}
          {formattedQuestions.length > 0 ? (
            <div className="space-y-6">
              {getDisplayedQuestions().map((question, index) => (
                <QuestionCard
                  key={`${question.id}-${displayOption}-${currentPage}`}
                  question={question}
                  selectedOption={_userAnswers[question.id] || null}
                  disabledOptions={disabledOptions[question.id] || []}
                  onOptionSelect={handleOptionSelect}
                  onToggleDisabled={handleToggleDisabled}
                  showNumber={displayOption === "single" ? activeQuestion + 1 : (currentPage - 1) * (displayOption === "ten" ? 10 : formattedQuestions.length) + index + 1}
                />
              ))}
              
              {/* Paginação para modo "ten" */}
              {displayOption === "ten" && getPageCount() > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={getPageCount()}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
              
              {/* Botões de navegação para modo "single" */}
              {displayOption === "single" && formattedQuestions.length > 1 && (
                <div className="flex justify-between mt-8">
                  <Button 
                    onClick={handlePreviousQuestion}
                    disabled={activeQuestion === 0}
                    variant="outline"
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
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default Simulado;