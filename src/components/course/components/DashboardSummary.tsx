import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { OverallStats, Subject } from "../types/editorialized";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PencilIcon, Loader2, Save, Clock, ArrowUpDown } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardSummaryProps {
  overallStats: OverallStats;
  performanceGoal: number;
  setPerformanceGoal: (value: number) => void;
  activeTab: string;
  subjects: Subject[];
  loading?: boolean;
  simuladosStats?: {
    total: number;
    realizados: number;
    questionsCount: number;
    hits: number;
    errors: number;
  };
  isEditMode: boolean;
  onToggleEditMode: () => void;
  isSaving: boolean;
  unsavedChanges: boolean;
  setUnsavedChanges: (value: boolean) => void;
  saveAllDataToDatabase: () => Promise<boolean>;
  examDate?: Date;
  updateExamDate: (date: Date | undefined) => void;
  lastSaveTime?: string | null;
  sortOrder: 'id' | 'importance';
  onSortOrderChange: (order: 'id' | 'importance') => void;
}

export const DashboardSummary = ({
  overallStats,
  performanceGoal,
  setPerformanceGoal,
  activeTab,
  subjects,
  loading,
  simuladosStats = {
    total: 0,
    realizados: 0,
    questionsCount: 0,
    hits: 0,
    errors: 0
  },
  isEditMode,
  onToggleEditMode,
  isSaving,
  unsavedChanges,
  setUnsavedChanges,
  examDate,
  updateExamDate,
  lastSaveTime,
  sortOrder,
  onSortOrderChange
}: DashboardSummaryProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id || 'guest';
  
  // Estados para as estatísticas reais
  const [realStats, setRealStats] = useState({
    totalHits: 0,
    totalErrors: 0,
    totalExercises: 0,
    overallPerformance: 0
  });

  // Efeito para buscar estatísticas reais quando os subjects mudam
  useEffect(() => {
    const fetchRealStats = async () => {
      if (!userId || userId === 'guest' || activeTab !== 'edital' || !subjects.length) {
        // Se não houver usuário ou não estiver na aba edital, usar as estatísticas gerais
        setRealStats({
          totalHits: overallStats.totalHits,
          totalErrors: overallStats.totalErrors,
          totalExercises: overallStats.totalExercises,
          overallPerformance: Math.round(overallStats.totalHits / Math.max(overallStats.totalExercises, 1) * 100) || 0
        });
        return;
      }
      
      try {
        // Coletar todos os links dos tópicos
        const allLinks = subjects.flatMap(subject => 
          subject.topics.map(topic => topic.link).filter((link): link is string => link !== undefined && link !== null)
        );

        if (allLinks.length === 0) {
          // Se não houver links, usar as estatísticas gerais
          setRealStats({
            totalHits: overallStats.totalHits,
            totalErrors: overallStats.totalErrors,
            totalExercises: overallStats.totalExercises,
            overallPerformance: Math.round(overallStats.totalHits / Math.max(overallStats.totalExercises, 1) * 100) || 0
          });
          return;
        }

        // Extrair IDs das questões de todos os links
        let allQuestionIds: string[] = [];
        
        for (const link of allLinks) {
          try {
            // Verificar se o link é válido antes de criar o URL
            if (!link) continue;
            
            const url = new URL(link);
            const searchParams = url.searchParams;
            
            // Construir query baseada nos filtros
            let query = supabase.from('questoes').select('id');

            // Aplicar filtros baseados nos parâmetros da URL
            if (searchParams.has('disciplines')) {
              const disciplines = JSON.parse(decodeURIComponent(searchParams.get('disciplines') || '[]'));
              if (disciplines.length > 0) {
                query = query.in('discipline', disciplines);
              }
            }

            if (searchParams.has('years')) {
              const years = JSON.parse(decodeURIComponent(searchParams.get('years') || '[]'));
              if (years.length > 0) {
                query = query.in('year', years);
              }
            }

            if (searchParams.has('institutions')) {
              const institutions = JSON.parse(decodeURIComponent(searchParams.get('institutions') || '[]'));
              if (institutions.length > 0) {
                query = query.in('institution', institutions);
              }
            }

            if (searchParams.has('organizations')) {
              const organizations = JSON.parse(decodeURIComponent(searchParams.get('organizations') || '[]'));
              if (organizations.length > 0) {
                query = query.in('organization', organizations);
              }
            }

            if (searchParams.has('roles')) {
              const roles = JSON.parse(decodeURIComponent(searchParams.get('roles') || '[]'));
              if (roles.length > 0) {
                query = query.contains('role', roles);
              }
            }

            if (searchParams.has('levels')) {
              const levels = JSON.parse(decodeURIComponent(searchParams.get('levels') || '[]'));
              if (levels.length > 0) {
                query = query.in('level', levels);
              }
            }

            if (searchParams.has('difficulties')) {
              const difficulties = JSON.parse(decodeURIComponent(searchParams.get('difficulties') || '[]'));
              if (difficulties.length > 0) {
                query = query.in('difficulty', difficulties);
              }
            }

            if (searchParams.has('subjects')) {
              const subjects = JSON.parse(decodeURIComponent(searchParams.get('subjects') || '[]'));
              if (subjects.length > 0) {
                query = query.overlaps('assuntos', subjects);
              }
            }

            if (searchParams.has('topics')) {
              const topics = JSON.parse(decodeURIComponent(searchParams.get('topics') || '[]'));
              if (topics.length > 0) {
                query = query.overlaps('assuntos', topics);
              }
            }

            if (searchParams.has('subtopics')) {
              const subtopics = JSON.parse(decodeURIComponent(searchParams.get('subtopics') || '[]'));
              if (subtopics.length > 0) {
                query = query.overlaps('topicos', subtopics);
              }
            }

            if (searchParams.has('educationLevels')) {
              const educationLevels = JSON.parse(decodeURIComponent(searchParams.get('educationLevels') || '[]'));
              if (educationLevels.length > 0) {
                query = query.in('level', educationLevels);
              }
            }

            // Buscar questões que correspondem aos filtros
            const { data: questions, error: questionsError } = await query;

            if (!questionsError && questions) {
              const questionIds = questions.map(q => q.id);
              allQuestionIds = [...allQuestionIds, ...questionIds];
            }
          } catch (error) {
            console.error('Erro ao processar link:', link, error);
          }
        }

        // Remover duplicatas
        allQuestionIds = [...new Set(allQuestionIds)];

        if (allQuestionIds.length === 0) {
          // Se não houver questões, usar as estatísticas gerais
          setRealStats({
            totalHits: overallStats.totalHits,
            totalErrors: overallStats.totalErrors,
            totalExercises: overallStats.totalExercises,
            overallPerformance: Math.round(overallStats.totalHits / Math.max(overallStats.totalExercises, 1) * 100) || 0
          });
          return;
        }

        // Buscar tentativas do usuário para essas questões
        const { data: attempts, error: attemptsError } = await supabase
          .from('user_question_attempts')
          .select('question_id, is_correct')
          .eq('user_id', userId)
          .in('question_id', allQuestionIds);

        if (attemptsError) {
          console.error('Erro ao buscar tentativas:', attemptsError);
          // Usar as estatísticas gerais em caso de erro
          setRealStats({
            totalHits: overallStats.totalHits,
            totalErrors: overallStats.totalErrors,
            totalExercises: overallStats.totalExercises,
            overallPerformance: Math.round(overallStats.totalHits / Math.max(overallStats.totalExercises, 1) * 100) || 0
          });
          return;
        }

        // Calcular estatísticas
        const totalAttempts = attempts?.length || 0;
        const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
        const wrongAnswers = totalAttempts - correctAnswers;
        const performance = totalAttempts > 0 ? Math.round(correctAnswers / totalAttempts * 100) : 0;

        setRealStats({
          totalHits: correctAnswers,
          totalErrors: wrongAnswers,
          totalExercises: totalAttempts,
          overallPerformance: performance
        });
      } catch (error) {
        console.error('Erro ao calcular estatísticas reais:', error);
        // Usar as estatísticas gerais em caso de erro
        setRealStats({
          totalHits: overallStats.totalHits,
          totalErrors: overallStats.totalErrors,
          totalExercises: overallStats.totalExercises,
          overallPerformance: Math.round(overallStats.totalHits / Math.max(overallStats.totalExercises, 1) * 100) || 0
        });
      }
    };

    fetchRealStats();
  }, [subjects, userId, activeTab, overallStats]);

  const overallProgress = Math.round(overallStats.completedTopics / overallStats.totalTopics * 100) || 0;
  // Usar as estatísticas reais calculadas
  const overallPerformance = realStats.overallPerformance;

  const handlePerformanceGoalChange = (value: number) => {
    const newValue = Math.max(1, Math.min(100, value || 1));
    
    if (newValue !== performanceGoal) {
      setPerformanceGoal(newValue);
      setUnsavedChanges(true);
      console.log("Meta modificada, marcando unsavedChanges como true");
    }
  };

  const handleExamDateChange = (date: Date | undefined) => {
    updateExamDate(date);
  };

  const daysUntilExam = React.useMemo(() => {
    if (!examDate) return null;
    const today = new Date();
    const days = differenceInDays(examDate, today);
    return days >= 0 ? days : null;
  }, [examDate]);

  const calculateAproveitamento = () => {
    if (simuladosStats.questionsCount === 0) return 0;
    return Math.round(simuladosStats.hits / simuladosStats.questionsCount * 100);
  };

  const handleSaveData = async () => {
    if (userId !== 'guest' && courseId) {
      onToggleEditMode();
    } else if (userId === 'guest') {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para salvar seus dados.",
        variant: "destructive"
      });
    }
  };

  const formatLastSaveTime = () => {
    if (!lastSaveTime) return null;
    
    try {
      const date = parseISO(lastSaveTime);
      return format(date, "'Último salvamento:' dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar último salvamento:", error);
      return null;
    }
  };

  const lastSaveFormatted = formatLastSaveTime();

  return (
    <div className="mb-8 p-5 bg-white rounded-[10px]">
      <div className="flex flex-col gap-4 mb-4 text-[#272f3c]">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Resumo Geral</h3>
          <div className="flex gap-2">
            {activeTab === 'edital' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortOrderChange(sortOrder === 'id' ? 'importance' : 'id')}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === 'id' ? 'Ordenar por Importância' : 'Ordenar por #'}
              </Button>
            )}
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={handleSaveData}
              disabled={loading || userId === 'guest' || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isEditMode ? (
                <Save className="h-4 w-4 mr-2" />
              ) : (
                <PencilIcon className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? "Salvar dados" : "Editar dados"}
            </Button>
          </div>
        </div>
        
        {lastSaveFormatted && (
          <div className="flex items-center text-xs text-gray-500 mt-[-8px]">
            <Clock className="h-3 w-3 mr-1" />
            <span>{lastSaveFormatted}</span>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Meta de Aproveitamento:</span>
            {isEditMode ? (
              <div className="flex items-center">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={performanceGoal}
                  onChange={(e) => handlePerformanceGoalChange(parseInt(e.target.value))}
                  className="w-20 text-center"
                />
                <span className="ml-1">%</span>
              </div>
            ) : (
              <span className="font-bold text-lg">{performanceGoal}%</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Data da Prova:</span>
            {isEditMode ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !examDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {examDate
                      ? format(examDate, "PPP", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={examDate}
                    onSelect={handleExamDateChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <span className="font-bold text-lg">
                {examDate ? format(examDate, "PPP", { locale: ptBR }) : "Não definida"}
              </span>
            )}
          </div>
        </div>
        
        {unsavedChanges && userId !== 'guest' && (
          <div className="text-amber-600 text-xs flex items-center">
            <span className="animate-pulse mr-1">●</span>
            Há alterações não salvas. Clique em "Salvar dados" para não perder seu progresso.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === 'edital' ? (
          <>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Evolução Geral</span>
                <span className="font-semibold">{overallProgress}%</span>
              </div>
              <Progress
                value={overallProgress}
                className="h-2 bg-gray-200"
              >
                <div
                  className="h-full bg-[#ea2be2]"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </Progress>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tópicos Concluídos</span>
                  <span className="font-semibold">
                    {overallStats.completedTopics}/{overallStats.totalTopics}
                  </span>
                </div>
                {daysUntilExam !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dias até a prova</span>
                    <span className="font-semibold text-blue-600">
                      {daysUntilExam}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Acertos</span>
                  <span className="font-semibold text-[#5f2ebe]">
                    {realStats.totalHits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erros</span>
                  <span className="font-semibold text-[#ffac33]">
                    {realStats.totalErrors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aproveitamento</span>
                  <span className="font-semibold">{overallPerformance}%</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Simulados Realizados</span>
                <span className="font-semibold">
                  {simuladosStats.realizados}/{simuladosStats.total}
                </span>
              </div>
              <Progress
                value={
                  simuladosStats.total > 0
                    ? (simuladosStats.realizados / simuladosStats.total) * 100
                    : 0
                }
                className="h-2 bg-gray-200"
              >
                <div
                  className="h-full bg-[#ea2be2]"
                  style={{
                    width: `${
                      simuladosStats.total > 0
                        ? (simuladosStats.realizados / simuladosStats.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </Progress>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questões Respondidas</span>
                  <span className="font-semibold">
                    {simuladosStats.questionsCount}
                  </span>
                </div>
                {daysUntilExam !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dias até a prova</span>
                    <span className="font-semibold text-blue-600">
                      {daysUntilExam}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Acertos</span>
                  <span className="font-semibold text-[#5f2ebe]">
                    {simuladosStats.hits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erros</span>
                  <span className="font-semibold text-[#ffac33]">
                    {simuladosStats.errors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aproveitamento</span>
                  <span className="font-semibold">
                    {calculateAproveitamento()}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};