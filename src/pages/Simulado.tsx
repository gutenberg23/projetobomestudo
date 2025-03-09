
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { QuestionItemType } from "@/components/admin/questions/types";
import { Json } from "@/integrations/supabase/types";

const Simulado = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [simulado, setSimulado] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);

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
          const formattedQuestions: QuestionItemType[] = questionsData.map((q: any) => ({
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

          setQuestions(formattedQuestions);
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
    if (activeQuestion < questions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
      window.scrollTo(0, 0);
    }
  };

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

  const currentQuestion = questions[activeQuestion];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[88px] bg-[#f6f8fa]">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-2xl font-bold text-[#272f3c] mb-2">{simulado.titulo}</h1>
            <div className="text-[#67748a] mb-4">
              <p>Total de questões: {questions.length}</p>
              {simulado.data_inicio && (
                <p>Disponível de: {new Date(simulado.data_inicio).toLocaleDateString('pt-BR')}</p>
              )}
              {simulado.data_fim && (
                <p>Até: {new Date(simulado.data_fim).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
            
            <div className="bg-[#f6f8fa] p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#67748a]">Progresso:</span>
                <span className="text-[#5f2ebe] font-semibold">{activeQuestion + 1} de {questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#5f2ebe] h-2.5 rounded-full" 
                  style={{ width: `${((activeQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {questions.length > 0 && currentQuestion ? (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#5f2ebe]/10 text-[#5f2ebe] text-xs px-2 py-1 rounded-full">
                    {currentQuestion.year}
                  </span>
                  <span className="bg-[#5f2ebe]/10 text-[#5f2ebe] text-xs px-2 py-1 rounded-full">
                    {currentQuestion.institution}
                  </span>
                  <span className="bg-[#5f2ebe]/10 text-[#5f2ebe] text-xs px-2 py-1 rounded-full">
                    {currentQuestion.discipline}
                  </span>
                </div>
                
                <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.content }}></div>
                
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {currentQuestion.options.map((option) => (
                      <div 
                        key={option.id} 
                        className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="w-6 h-6 border-2 border-[#5f2ebe] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          {/* Circle will be filled when selected */}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: option.text }}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  onClick={handlePreviousQuestion}
                  disabled={activeQuestion === 0}
                  variant="secondary"
                >
                  Questão Anterior
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={activeQuestion === questions.length - 1}
                >
                  Próxima Questão
                </Button>
              </div>
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
