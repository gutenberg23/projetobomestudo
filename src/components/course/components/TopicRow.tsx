import { cn } from "@/lib/utils";
import { Topic } from "../types/editorialized";
import { calculatePerformance } from "../utils/statsCalculations";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuestionStatsFromLink } from "@/hooks/useQuestionStatsFromLink";
import { useSubjectImportanceStats } from "@/hooks/useSubjectImportanceStats";

interface TopicRowProps {
  topic: Topic;
  index: number;
  subjectId: string | number;
  performanceGoal: number;
  currentUserId: string | undefined;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
  isEditMode: boolean;
  allSubjects: any[];
}

export const TopicRow = ({
  topic,
  index,
  subjectId,
  performanceGoal,
  currentUserId,
  onTopicChange,
  isEditMode,
  allSubjects
}: TopicRowProps) => {
  const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
  const { importanceStats } = useSubjectImportanceStats(allSubjects, currentUserId);
  
  const importanceData = importanceStats[topic.id] || { questionsCount: stats.totalQuestions, percentage: 0 };

  return (
    <tr className={cn("border-t border-gray-200", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
      <td className="py-3 px-4">{topic.id}</td>
      <td className="py-3 px-4 text-center">
        <span className="text-sm">
          {importanceData.questionsCount} ({importanceData.percentage}%)
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          {isEditMode ? (
            <div onClick={e => {
              e.stopPropagation();
              onTopicChange(subjectId, topic.id, 'isDone', !topic.isDone);
            }} className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded cursor-pointer ${topic.isDone ? "bg-[#5f2ebe] border-[#5f2ebe]" : "bg-white border border-gray-200"}`}>
              {topic.isDone && <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4 m-auto">
                  <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
            </div>
          ) : (
            <div className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded ${topic.isDone ? "bg-[#5f2ebe] border-[#5f2ebe]" : "bg-white border border-gray-200"}`}>
              {topic.isDone && <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4 m-auto">
                  <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4 max-w-xs">
        <p className="text-sm text-gray-600">{topic.topic}</p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center">
          {topic.link ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-blue-600"
              onClick={() => window.open(topic.link, '_blank')}
              title="Abrir link de questões"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="text-xs">Questões</span>
            </Button>
          ) : (
            <span className="text-xs text-gray-400">Sem link</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span>{stats.totalAttempts}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span>{stats.correctAnswers}</span>
      </td>
      <td className="py-3 px-4 text-center">{stats.wrongAnswers}</td>
      <td className={cn(
        "py-3 px-4 text-center", 
        stats.totalAttempts === 0 
          ? "" 
          : calculatePerformance(stats.correctAnswers, stats.totalAttempts) < performanceGoal 
            ? "bg-[#fceadf]" 
            : "bg-[#e4e0f3]"
      )}>
        {stats.totalAttempts > 0 ? calculatePerformance(stats.correctAnswers, stats.totalAttempts) : 0}%
      </td>
    </tr>
  );
};