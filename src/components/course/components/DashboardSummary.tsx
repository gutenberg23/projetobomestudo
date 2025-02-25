
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { OverallStats } from "../types/editorialized";

interface DashboardSummaryProps {
  overallStats: OverallStats;
  performanceGoal: number;
  setPerformanceGoal: (value: number) => void;
}

export const DashboardSummary = ({ overallStats, performanceGoal, setPerformanceGoal }: DashboardSummaryProps) => {
  const overallProgress = Math.round((overallStats.completedTopics / overallStats.totalTopics) * 100) || 0;
  const overallPerformance = Math.round((overallStats.totalHits / overallStats.totalExercises) * 100) || 0;

  return (
    <div className="mb-8 p-5 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Resumo Geral</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Meta de Aproveitamento:</span>
          <Input
            type="number"
            min="1"
            max="100"
            value={performanceGoal}
            onChange={(e) => setPerformanceGoal(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-20 text-center"
          />
          <span className="text-sm text-gray-600">%</span>
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
            <div className="flex justify-between">
              <span className="text-gray-600">Questões Feitas</span>
              <span className="font-semibold">{overallStats.totalExercises}</span>
            </div>
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
