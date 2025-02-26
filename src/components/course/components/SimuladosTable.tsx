
import React from "react";
import { cn } from "@/lib/utils";

interface Simulado {
  id: number;
  launchDate: string;
  title: string;
  questionsCount: number;
  hits: number;
  errors: number;
}

interface SimuladosTableProps {
  performanceGoal: number;
}

const simulados: Simulado[] = [
  {
    id: 1,
    launchDate: "2024-03-01",
    title: "Simulado Geral #1",
    questionsCount: 100,
    hits: 75,
    errors: 25,
  },
  {
    id: 2,
    launchDate: "2024-03-15",
    title: "Simulado Específico - Direito Constitucional",
    questionsCount: 50,
    hits: 42,
    errors: 8,
  },
];

export const SimuladosTable = ({ performanceGoal }: SimuladosTableProps) => {
  const calculatePerformance = (hits: number, total: number) => {
    return Math.round((hits / total) * 100);
  };

  const totals = simulados.reduce(
    (acc, simulado) => ({
      questionsCount: acc.questionsCount + simulado.questionsCount,
      hits: acc.hits + simulado.hits,
      errors: acc.errors + simulado.errors,
    }),
    { questionsCount: 0, hits: 0, errors: 0 }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-[10px] p-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="py-3 px-4 text-left font-medium">Data</th>
              <th className="py-3 px-4 text-left font-medium">Título</th>
              <th className="py-3 px-4 text-center font-medium">Questões</th>
              <th className="py-3 px-4 text-center font-medium">Acertos</th>
              <th className="py-3 px-4 text-center font-medium">Erros</th>
              <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
            </tr>
          </thead>
          <tbody>
            {simulados.map((simulado) => (
              <tr key={simulado.id} className="border-t border-gray-200">
                <td className="py-3 px-4">{formatDate(simulado.launchDate)}</td>
                <td className="py-3 px-4">{simulado.title}</td>
                <td className="py-3 px-4 text-center">{simulado.questionsCount}</td>
                <td className="py-3 px-4 text-center">{simulado.hits}</td>
                <td className="py-3 px-4 text-center">{simulado.errors}</td>
                <td className={cn(
                  "py-3 px-4 text-center",
                  calculatePerformance(simulado.hits, simulado.questionsCount) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
                )}>
                  {calculatePerformance(simulado.hits, simulado.questionsCount)}%
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-200 bg-gray-50 font-medium">
              <td colSpan={2} className="py-3 px-4 text-right">Totais:</td>
              <td className="py-3 px-4 text-center">{totals.questionsCount}</td>
              <td className="py-3 px-4 text-center">{totals.hits}</td>
              <td className="py-3 px-4 text-center">{totals.errors}</td>
              <td className={cn(
                "py-3 px-4 text-center",
                calculatePerformance(totals.hits, totals.questionsCount) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
              )}>
                {calculatePerformance(totals.hits, totals.questionsCount)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
