import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { calculatePerformance } from "../utils/statsCalculations";
import { Topic } from "../types/editorialized";

interface UserStats {
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
}

interface TotalsRowProps {
  topics: Topic[];
  performanceGoal: number;
  importancePercentage?: number;
  userStats?: UserStats;
}

export const TotalsRow = ({ topics, performanceGoal, importancePercentage = 0, userStats }: TotalsRowProps) => {
  // Use disciplina stats if available, otherwise use zero values
  const totalStats = useMemo(() => {
    if (userStats) {
      return userStats;
    }
    
    // Return zero values if no stats available
    return { 
      totalAttempts: 0, 
      correctAnswers: 0, 
      wrongAnswers: 0 
    };
  }, [userStats]);

  // Adicionar log para verificar estatísticas totais
  console.log(`[TotalsRow] Estatísticas totais:`, totalStats);
  
  const performance = totalStats.totalAttempts > 0 ? calculatePerformance(totalStats.correctAnswers, totalStats.totalAttempts) : 0;

  return (
    <tr className="border-t border-gray-200 bg-gray-50 font-medium">
      <td colSpan={4} className="py-3 px-4 text-right">Totais:</td>
      <td className="py-3 px-4 text-center font-bold text-[#5f2ebe]">
        {importancePercentage}%
      </td>
      <td className="py-3 px-4 text-center">
        {totalStats.totalAttempts}
      </td>
      <td className="py-3 px-4 text-center">
        {totalStats.correctAnswers}
      </td>
      <td className="py-3 px-4 text-center">
        {totalStats.wrongAnswers}
      </td>
      <td className={cn(
        "py-3 px-4 text-center", 
        totalStats.totalAttempts === 0 
          ? "" 
          : performance < performanceGoal 
            ? "bg-[#fceadf]" 
            : "bg-[#e4e0f3]"
      )}>
        {performance}%
      </td>
    </tr>
  );
};