import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Topic } from "../types/editorialized";
import { calculatePerformance } from "../utils/statsCalculations";
import { useQuestionStatsFromLink } from "@/hooks/useQuestionStatsFromLink";
import { useSubjectImportanceStats } from "@/hooks/useSubjectImportanceStats";

interface TotalsRowProps {
  topics: Topic[];
  performanceGoal: number;
  currentUserId: string | undefined;
  allSubjects: any[];
}

export const TotalsRow = ({ topics, performanceGoal, currentUserId, allSubjects }: TotalsRowProps) => {
  // Get stats for each topic and calculate totals
  const topicStatsArray = topics.map(topic => {
    const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
    return stats;
  });

  const { importanceStats } = useSubjectImportanceStats(allSubjects, currentUserId);

  const totalStats = useMemo(() => {
    return topicStatsArray.reduce((acc, stats) => ({
      totalQuestions: acc.totalQuestions + stats.totalQuestions,
      totalAttempts: acc.totalAttempts + stats.totalAttempts,
      correctAnswers: acc.correctAnswers + stats.correctAnswers,
      wrongAnswers: acc.wrongAnswers + stats.wrongAnswers,
    }), { totalQuestions: 0, totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 });
  }, [topicStatsArray]);

  // Calculate total importance questions count
  const totalImportanceQuestions = useMemo(() => {
    return topics.reduce((acc, topic) => {
      const topicImportance = importanceStats[topic.id] || { questionsCount: 0, percentage: 0 };
      return acc + topicImportance.questionsCount;
    }, 0);
  }, [topics, importanceStats]);

  const performance = totalStats.totalAttempts > 0 ? calculatePerformance(totalStats.correctAnswers, totalStats.totalAttempts) : 0;

  return (
    <tr className="bg-gray-100 font-semibold border-t border-gray-300">
      <td className="py-3 px-4">Total</td>
      <td className="py-3 px-4 text-center">{totalImportanceQuestions} (100%)</td>
      <td className="py-3 px-4"></td>
      <td className="py-3 px-4">-</td>
      <td className="py-3 px-4 text-center">-</td>
      <td className="py-3 px-4 text-center">{totalStats.totalAttempts}</td>
      <td className="py-3 px-4 text-center">{totalStats.correctAnswers}</td>
      <td className="py-3 px-4 text-center">{totalStats.wrongAnswers}</td>
      <td className={cn(
        "py-3 px-4 text-center", 
        totalStats.totalAttempts === 0 
          ? "" 
          : calculatePerformance(totalStats.correctAnswers, totalStats.totalAttempts) < performanceGoal 
            ? "bg-[#fceadf]" 
            : "bg-[#e4e0f3]"
      )}>
        {totalStats.totalAttempts > 0 ? calculatePerformance(totalStats.correctAnswers, totalStats.totalAttempts) : 0}%
      </td>
    </tr>
  );
};