
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Subject, Topic } from "../types/editorialized";
import { calculateErrors, calculatePerformance, calculateSubjectTotals } from "../utils/statsCalculations";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuestionStatsFromLink } from "@/hooks/useQuestionStatsFromLink";
import { supabase } from "@/integrations/supabase/client";

interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
  isEditMode: boolean;
}

export const SubjectTable = ({
  subject,
  performanceGoal,
  onTopicChange,
  isEditMode
}: SubjectTableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round(subjectTotals.completedTopics / subjectTotals.totalTopics * 100);
  const subjectPerformance = calculatePerformance(subjectTotals.hits, subjectTotals.exercisesDone);

  // Buscar o usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return <div className={`${isExpanded ? 'mb-8' : 'mb-3'} last:mb-0`}>
      <div className="flex items-center justify-between bg-white text-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleExpanded}>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <h2 className="text-sm md:text-lg font-semibold">{subject.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 md:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#5f2ebe] transition-all" style={{
            width: `${subjectProgress}%`
          }} />
          </div>
          <span className="text-xs md:text-sm">{subjectProgress}%</span>
        </div>
      </div>
      {isExpanded && (
        <div className="border border-gray-200 rounded-lg mt-2 overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-600">
                <th className="py-3 px-4 text-left font-medium w-8">#</th>
                <th className="py-3 px-4 text-left font-medium">Conclusão</th>
                <th className="py-3 px-4 text-left font-medium">Tópicos</th>
                <th className="py-3 px-4 text-left font-medium">Link</th>
                <th className="py-3 px-4 text-center font-medium">Total Exercícios feitos</th>
                <th className="py-3 px-4 text-center font-medium">Acertos</th>
                <th className="py-3 px-4 text-center font-medium">Erros</th>
                <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              {subject.topics.map((topic, index) => {
                const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                return (
                  <tr key={topic.id} className={cn("border-t border-gray-200", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                    <td className="py-3 px-4">{topic.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {isEditMode ? (
                          <div onClick={e => {
                            e.stopPropagation();
                            onTopicChange(subject.id, topic.id, 'isDone', !topic.isDone);
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
              })}
              <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                <td colSpan={4} className="py-3 px-4 text-right">Totais:</td>
                <td className="py-3 px-4 text-center">
                  {subject.topics.reduce((acc, topic) => {
                    const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                    return acc + stats.totalAttempts;
                  }, 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  {subject.topics.reduce((acc, topic) => {
                    const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                    return acc + stats.correctAnswers;
                  }, 0)}
                </td>
                <td className="py-3 px-4 text-center">
                  {subject.topics.reduce((acc, topic) => {
                    const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                    return acc + stats.wrongAnswers;
                  }, 0)}
                </td>
                <td className={cn(
                  "py-3 px-4 text-center", 
                  (() => {
                    const totalAttempts = subject.topics.reduce((acc, topic) => {
                      const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                      return acc + stats.totalAttempts;
                    }, 0);
                    const totalCorrect = subject.topics.reduce((acc, topic) => {
                      const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                      return acc + stats.correctAnswers;
                    }, 0);
                    const performance = totalAttempts > 0 ? calculatePerformance(totalCorrect, totalAttempts) : 0;
                    return performance === 0 
                      ? "" 
                      : performance < performanceGoal 
                        ? "bg-[#fceadf]" 
                        : "bg-[#e4e0f3]";
                  })()
                )}>
                  {(() => {
                    const totalAttempts = subject.topics.reduce((acc, topic) => {
                      const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                      return acc + stats.totalAttempts;
                    }, 0);
                    const totalCorrect = subject.topics.reduce((acc, topic) => {
                      const { stats } = useQuestionStatsFromLink(topic.link, currentUserId);
                      return acc + stats.correctAnswers;
                    }, 0);
                    return totalAttempts > 0 ? calculatePerformance(totalCorrect, totalAttempts) : 0;
                  })()}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>;
};
