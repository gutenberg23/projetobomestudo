
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { OverallStats, Subject } from "../types/editorialized";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckIcon, XIcon, PencilIcon, Loader2, Save } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';
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
  saveAllDataToDatabase
}: DashboardSummaryProps) => {
  const {
    courseId
  } = useParams<{
    courseId: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const userId = user?.id || 'guest';
  const overallProgress = Math.round(overallStats.completedTopics / overallStats.totalTopics * 100) || 0;
  const overallPerformance = Math.round(overallStats.totalHits / overallStats.totalExercises * 100) || 0;
  const [examDate, setExamDate] = React.useState<Date | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(performanceGoal);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const loadUserData = async () => {
      const realId = extractIdFromFriendlyUrl(courseId);
      if (userId !== 'guest') {
        try {
          const { data, error } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', realId)
            .maybeSingle();
            
          if (!error && data) {
            if (data.performance_goal) {
              const goalValue = parseInt(data.performance_goal.toString());
              setPerformanceGoal(goalValue);
            }
            if (data.exam_date) {
              const examDateValue = new Date(data.exam_date);
              setExamDate(examDateValue);
            }
            return;
          }
        } catch (e) {
          console.error('Erro ao buscar dados do usuário:', e);
        }
      } else {
        setPerformanceGoal(70);
        setExamDate(undefined);
      }
    };
    loadUserData();
  }, [courseId, setPerformanceGoal, userId]);

  const saveUserDataToDatabase = async (field: string, value: string | number | null) => {
    if (!courseId || userId === 'guest') return;
    const realId = extractIdFromFriendlyUrl(courseId);
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log("Erro ao verificar sessão:", sessionError);
        toast({
          title: "Erro",
          description: "Não foi possível verificar sua sessão. Tente fazer login novamente.",
          variant: "destructive"
        });
        return;
      }
      
      if (!sessionData.session) {
        console.log("Nenhuma sessão ativa encontrada");
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive"
        });
        return;
      }
      
      const { data: existingData, error: checkError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', realId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar dados existentes:', checkError);
        return;
      }
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      updateData[field] = value;
      
      if (existingData) {
        const { error: updateError } = await supabase
          .from('user_course_progress')
          .update(updateData)
          .eq('id', existingData.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar ${field}:`, updateError);
          toast({
            title: "Erro",
            description: `Não foi possível salvar ${field === 'performance_goal' ? 'a meta de aproveitamento' : 'a data da prova'}.`,
            variant: "destructive"
          });
        }
      } else {
        const insertData: any = {
          user_id: userId,
          course_id: realId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        insertData[field] = value;
        
        const { error: insertError } = await supabase
          .from('user_course_progress')
          .insert(insertData);
          
        if (insertError) {
          console.error(`Erro ao inserir ${field}:`, insertError);
          toast({
            title: "Erro",
            description: `Não foi possível salvar ${field === 'performance_goal' ? 'a meta de aproveitamento' : 'a data da prova'}.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao salvar ${field}:`, error);
    }
  };

  const handlePerformanceGoalChange = (value: number) => {
    const newValue = Math.max(1, Math.min(100, value || 1));
    
    if (newValue !== performanceGoal) {
      setPerformanceGoal(newValue);
      setUnsavedChanges(true);
      console.log("Meta modificada, marcando unsavedChanges como true");
      
      if (courseId && userId !== 'guest' && !isEditMode) {
        saveUserDataToDatabase('performance_goal', newValue);
      }
    }
  };

  const handleExamDateChange = (date: Date | undefined) => {
    if (date?.toISOString() !== examDate?.toISOString()) {
      setExamDate(date);
      setUnsavedChanges(true);
      console.log("Data modificada, marcando unsavedChanges como true");
      
      if (courseId && userId !== 'guest' && !isEditMode) {
        if (date) {
          const dateString = date.toISOString();
          saveUserDataToDatabase('exam_date', dateString);
        } else {
          saveUserDataToDatabase('exam_date', null);
        }
      }
    }
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

  return (
    <div className="mb-8 p-5 bg-white rounded-[10px]">
      <div className="flex flex-col gap-4 mb-4 text-[#272f3c]">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Resumo Geral</h3>
          <div className="flex gap-2">
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
                  <span className="text-gray-600">Aulas Concluídas</span>
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
                    {overallStats.totalHits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erros</span>
                  <span className="font-semibold text-[#ffac33]">
                    {overallStats.totalErrors}
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
