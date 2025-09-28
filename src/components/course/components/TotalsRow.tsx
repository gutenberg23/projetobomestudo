import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Topic } from "../types/editorialized";
import { calculatePerformance } from "../utils/statsCalculations";
import { useQuestionStatsFromLink } from "@/hooks/useQuestionStatsFromLink";

interface TotalsRowProps {
  topics: Topic[];
  performanceGoal: number;
  currentUserId: string | undefined;
}

export const TotalsRow = ({ topics, performanceGoal, currentUserId }: TotalsRowProps) => {
  // Get stats for each topic and calculate totals
  const topicStatsArray = topics.map(topic => {
    const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
    return stats;
  });

  const totalStats = useMemo(() => {
    return topicStatsArray.reduce((acc, stats) => ({
      totalAttempts: acc.totalAttempts + stats.totalAttempts,
      correctAnswers: acc.correctAnswers + stats.correctAnswers,
      wrongAnswers: acc.wrongAnswers + stats.wrongAnswers,
    }), { totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 });
  }, [topicStatsArray]);

  const performance = totalStats.totalAttempts > 0 ? calculatePerformance(totalStats.correctAnswers, totalStats.totalAttempts) : 0;

  return (
    <tr className="border-t border-gray-200 bg-gray-50 font-medium">
      <td colSpan={4} className="py-3 px-4 text-right">Totais:</td>
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