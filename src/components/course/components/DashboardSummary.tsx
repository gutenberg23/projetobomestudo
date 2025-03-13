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
  const userId = user?.id || 'guest';
  const overallProgress = Math.round(overallStats.completedTopics / overallStats.totalTopics * 100) || 0;
  const overallPerformance = Math.round(overallStats.totalHits / overallStats.totalExercises * 100) || 0;
  const [examDate, setExamDate] = React.useState<Date | undefined>();
  
  // Carregar dados salvos do localStorage quando o componente é montado
  useEffect(() => {
    if (!courseId) return;
    
    // Carregar a meta de aproveitamento
    const savedGoal = localStorage.getItem(`${userId}_${courseId}_performanceGoal`);
    if (savedGoal) {
      setPerformanceGoal(parseInt(savedGoal));
    }
    
    // Carregar a data da prova
    const savedExamDate = localStorage.getItem(`${userId}_${courseId}_examDate`);
    if (savedExamDate) {
      setExamDate(new Date(savedExamDate));
    }
  }, [courseId, setPerformanceGoal, userId]);
  
  // Salvar a meta de aproveitamento no localStorage quando ela mudar
  const handlePerformanceGoalChange = (value: number) => {
    const newValue = Math.max(1, Math.min(100, value || 1));
    setPerformanceGoal(newValue);
    if (courseId) {
      localStorage.setItem(`${userId}_${courseId}_performanceGoal`, newValue.toString());
    }
  };
  
  // Salvar a data da prova no localStorage quando ela mudar
  const handleExamDateChange = (date: Date | undefined) => {
    setExamDate(date);
    if (courseId && date) {
      localStorage.setItem(`${userId}_${courseId}_examDate`, date.toISOString());
    } else if (courseId) {
      localStorage.removeItem(`${userId}_${courseId}_examDate`);
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
