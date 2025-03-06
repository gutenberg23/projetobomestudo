
import React from "react";
import { ProgressSummary } from "./ProgressSummary";
import { Subject } from "../types/editorialized";

interface DashboardSummaryProps {
  overallStats: {
    topicsCount: number;
    topicsDone: number;
    averagePerformance: number;
  };
  performanceGoal: number;
  setPerformanceGoal: (goal: number) => void;
  activeTab?: string;
  subjects: Subject[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  overallStats,
  performanceGoal,
  setPerformanceGoal,
  activeTab,
  subjects
}) => {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-[#272f3c] mb-4">
        {activeTab === 'edital' ? 'Sumário do Edital' : 'Simulados Disponíveis'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-[#272f3c] mb-2">
            {activeTab === 'edital' ? 'Progresso do Edital' : 'Status dos Simulados'}
          </h3>
          <p className="text-[#67748a] mb-4 text-sm">
            {activeTab === 'edital' 
              ? 'Seu progresso atual no estudo do edital.'
              : 'Status atual dos seus simulados realizados.'}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#67748a] text-sm">Tópicos estudados</p>
              <p className="text-2xl font-bold text-[#272f3c]">
                {overallStats.topicsDone}/{overallStats.topicsCount}
              </p>
            </div>
            <ProgressSummary 
              progress={Math.round((overallStats.topicsDone / Math.max(1, overallStats.topicsCount)) * 100)} 
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-[#272f3c] mb-2">Desempenho Médio</h3>
          <p className="text-[#67748a] mb-4 text-sm">
            {activeTab === 'edital' 
              ? 'Seu desempenho médio nos exercícios.'
              : 'Seu desempenho médio nos simulados.'}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#67748a] text-sm">Performance</p>
              <p className="text-2xl font-bold text-[#272f3c]">
                {overallStats.averagePerformance.toFixed(1)}%
              </p>
            </div>
            <ProgressSummary 
              progress={overallStats.averagePerformance} 
              performanceGoal={performanceGoal}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-[#272f3c] mb-2">Meta de Desempenho</h3>
          <p className="text-[#67748a] mb-4 text-sm">
            Defina sua meta de desempenho para os estudos.
          </p>
          <div>
            <label htmlFor="performanceGoal" className="text-[#67748a] text-sm">
              Meta de acertos: {performanceGoal}%
            </label>
            <input
              id="performanceGoal"
              type="range"
              min="50"
              max="100"
              step="5"
              value={performanceGoal}
              onChange={(e) => setPerformanceGoal(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
            />
            <div className="flex justify-between text-xs text-[#67748a] mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
