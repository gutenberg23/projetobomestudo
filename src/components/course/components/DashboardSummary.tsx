import React from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { OverallStats } from "../types/editorialized";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DashboardSummaryProps {
  overallStats: OverallStats;
  performanceGoal: number;
  setPerformanceGoal: (value: number) => void;
}

export const DashboardSummary = ({
  overallStats,
  performanceGoal,
  setPerformanceGoal
}: DashboardSummaryProps) => {
  const overallProgress = Math.round(overallStats.completedTopics / overallStats.totalTopics * 100) || 0;
  const overallPerformance = Math.round(overallStats.totalHits / overallStats.totalExercises * 100) || 0;
  const [examDate, setExamDate] = React.useState<Date>();

  const daysUntilExam = React.useMemo(() => {
    if (!examDate) return null;
    const today = new Date();
    const days = differenceInDays(examDate, today);
    return days >= 0 ? days : null;
  }, [examDate]);

  return (
    <div className="mb-8 p-5 border rounded-lg bg-gray-50 mt-7">
      <div className="flex flex-col gap-4 mb-4">
        <h3 className="text-lg font-semibold">Resumo Geral</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Meta de Aproveitamento:</span>
            <Input
              type="number"
              min="1"
              max="100"
              value={performanceGoal}
              onChange={e => setPerformanceGoal(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-20 text-center"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Data da Prova:</span>
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
                  {examDate ? format(examDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={examDate} onSelect={setExamDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Evolução Geral</span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
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
        <div className="p-4 bg-white rounded-lg shadow">
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
      </div>
    </div>
  );
};
