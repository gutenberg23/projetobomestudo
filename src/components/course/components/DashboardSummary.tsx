import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { OverallStats, Subject } from "../types/editorialized";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
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
}

export const DashboardSummary = ({
  overallStats,
  performanceGoal,
  setPerformanceGoal,
  activeTab,
  subjects
}: DashboardSummaryProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id || 'guest';
  const overallProgress = Math.round(overallStats.completedTopics / overallStats.totalTopics * 100) || 0;
  const overallPerformance = Math.round(overallStats.totalHits / overallStats.totalExercises * 100) || 0;
  const [examDate, setExamDate] = React.useState<Date | undefined>();
  
  // Carregar dados salvos do localStorage e do banco de dados quando o componente é montado
  useEffect(() => {
    if (!courseId) return;
    
    const loadUserData = async () => {
      const realId = extractIdFromFriendlyUrl(courseId);
      
      // Se o usuário estiver logado, tentar buscar dados do banco primeiro
      if (userId !== 'guest') {
        try {
          const { data, error } = await supabase
            .from('user_course_progress')
            .select('performance_goal, exam_date')
            .eq('user_id', userId)
            .eq('course_id', realId)
            .single();
          
          if (!error && data) {
            // Carregar a meta de aproveitamento do banco
            if (data.performance_goal) {
              const goalValue = parseInt(data.performance_goal.toString());
              setPerformanceGoal(goalValue);
              localStorage.setItem(`${userId}_${realId}_performanceGoal`, goalValue.toString());
            }
            
            // Carregar a data da prova do banco
            if (data.exam_date) {
              const examDateValue = new Date(data.exam_date);
              setExamDate(examDateValue);
              localStorage.setItem(`${userId}_${realId}_examDate`, data.exam_date);
            }
            
            return;
          }
        } catch (e) {
          console.error('Erro ao buscar dados do usuário:', e);
        }
      }
      
      // Se não encontrou no banco ou deu erro, carregar do localStorage
      
      // Carregar a meta de aproveitamento
      const savedGoal = localStorage.getItem(`${userId}_${realId}_performanceGoal`);
      if (savedGoal) {
        setPerformanceGoal(parseInt(savedGoal));
      }
      
      // Carregar a data da prova
      const savedExamDate = localStorage.getItem(`${userId}_${realId}_examDate`);
      if (savedExamDate) {
        setExamDate(new Date(savedExamDate));
      }
    };
    
    loadUserData();
  }, [courseId, setPerformanceGoal, userId]);
  
  // Função para salvar dados no banco de dados
  const saveUserDataToDatabase = async (field: string, value: string | number | null) => {
    if (!courseId || userId === 'guest') return;
    
    const realId = extractIdFromFriendlyUrl(courseId);
    
    try {
      // Verificar se o registro já existe
      const { data: existingData, error: checkError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', realId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao verificar dados existentes:', checkError);
        return;
      }
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      updateData[field] = value;
      
      if (existingData) {
        // Atualizar registro existente
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
        // Criar novo registro
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
  
  // Salvar a meta de aproveitamento no localStorage e no banco de dados quando ela mudar
  const handlePerformanceGoalChange = (value: number) => {
    const newValue = Math.max(1, Math.min(100, value || 1));
    setPerformanceGoal(newValue);
    
    if (courseId) {
      const realId = extractIdFromFriendlyUrl(courseId);
      const stringValue = newValue.toString();
      
      // Salvar no localStorage
      localStorage.setItem(`${userId}_${realId}_performanceGoal`, stringValue);
      
      // Salvar no banco de dados se o usuário estiver logado
      if (userId !== 'guest') {
        saveUserDataToDatabase('performance_goal', newValue);
      }
    }
  };
  
  // Salvar a data da prova no localStorage e no banco de dados quando ela mudar
  const handleExamDateChange = (date: Date | undefined) => {
    setExamDate(date);
    
    if (courseId) {
      const realId = extractIdFromFriendlyUrl(courseId);
      
      if (date) {
        const dateString = date.toISOString();
        
        // Salvar no localStorage
        localStorage.setItem(`${userId}_${realId}_examDate`, dateString);
        
        // Salvar no banco de dados se o usuário estiver logado
        if (userId !== 'guest') {
          saveUserDataToDatabase('exam_date', dateString);
        }
      } else {
        // Remover do localStorage
        localStorage.removeItem(`${userId}_${realId}_examDate`);
        
        // Remover do banco de dados se o usuário estiver logado
        if (userId !== 'guest') {
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
  
  return <div className="mb-8 p-5 bg-white rounded-[10px]">
      <div className="flex flex-col gap-4 mb-4 text-[#272f3c]">
        <h3 className="text-2xl font-bold">Resumo Geral</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Meta de Aproveitamento:</span>
            <Input 
              type="number" 
              min="1" 
              max="100" 
              value={performanceGoal} 
              onChange={e => handlePerformanceGoalChange(parseInt(e.target.value))} 
              className="w-20 text-center" 
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Data da Prova:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", !examDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {examDate ? format(examDate, "PPP", {
                  locale: ptBR
                }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={examDate} onSelect={handleExamDateChange} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === 'edital' ? <>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Evolução Geral</span>
                <span className="font-semibold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-gray-200">
                <div className="h-full bg-[#ea2be2]" style={{
              width: `${overallProgress}%`
            }} />
              </Progress>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aulas Concluídas</span>
                  <span className="font-semibold">{overallStats.completedTopics}/{overallStats.totalTopics}</span>
                </div>
                {daysUntilExam !== null && <div className="flex justify-between">
                    <span className="text-gray-600">Dias até a prova</span>
                    <span className="font-semibold text-blue-600">{daysUntilExam}</span>
                  </div>}
              </div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Acertos</span>
                  <span className="font-semibold text-green-600">{overallStats.totalHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erros</span>
                  <span className="font-semibold text-red-600">{overallStats.totalErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aproveitamento</span>
                  <span className="font-semibold">{overallPerformance}%</span>
                </div>
              </div>
            </div>
          </> : <>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Simulados Realizados</span>
                <span className="font-semibold">2</span>
              </div>
              <Progress value={100} className="h-2 bg-gray-200">
                <div className="h-full bg-[#ea2be2]" style={{
              width: `100%`
            }} />
              </Progress>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questões Respondidas</span>
                  <span className="font-semibold">150</span>
                </div>
                {daysUntilExam !== null && <div className="flex justify-between">
                    <span className="text-gray-600">Dias até a prova</span>
                    <span className="font-semibold text-blue-600">{daysUntilExam}</span>
                  </div>}
              </div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#f6f8fa]">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Acertos</span>
                  <span className="font-semibold text-green-600">117</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Erros</span>
                  <span className="font-semibold text-red-600">33</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aproveitamento</span>
                  <span className="font-semibold">{Math.round(117 / 150 * 100)}%</span>
                </div>
              </div>
            </div>
          </>}
      </div>
    </div>;
};
