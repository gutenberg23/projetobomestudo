import { useState, useEffect } from "react";
import { Subject, Topic } from "../types/editorialized";
import { calculateSubjectTotals } from "../utils/statsCalculations";
import { supabase } from "@/integrations/supabase/client";
import { TopicRow } from "./TopicRow";
import { TotalsRow } from "./TotalsRow";
import { useSubjectImportanceStats } from "@/hooks/useSubjectImportanceStats";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
  isEditMode: boolean;
  subjects: Subject[];
  onSortChange?: (sortBy: 'id' | 'importance') => void;
}

export const SubjectTable = ({
  subject,
  performanceGoal,
  onTopicChange,
  isEditMode,
  subjects,
  onSortChange
}: SubjectTableProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'id' | 'importance'>('id');
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round(subjectTotals.completedTopics / subjectTotals.totalTopics * 100);
  
  const { importanceStats, userStats } = useSubjectImportanceStats(subjects, currentUserId);

  // Buscar o usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  const handleSortToggle = () => {
    const newSortBy = sortBy === 'id' ? 'importance' : 'id';
    setSortBy(newSortBy);
    onSortChange?.(newSortBy);
  };

  const currentSubjectStats = userStats[subject.id.toString()] || {
    totalAttempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0
  };

  const currentImportanceStats = importanceStats[subject.id.toString()] || {
    percentage: 0,
    rawCount: 0
  };

  return <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-between bg-white text-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-sm md:text-lg font-semibold">{subject.name}</h2>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortToggle}
              className="ml-2 h-8 px-3 text-xs"
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              {sortBy === 'id' ? 'Ordenar por importância' : 'Ordenar por #'}
            </Button>
          )}
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
      <div className="border border-gray-200 rounded-lg mt-2 overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="py-3 px-4 text-left font-medium w-8">#</th>
              <th className="py-3 px-4 text-left font-medium">Conclusão</th>
              <th className="py-3 px-4 text-left font-medium">Tópicos</th>
              <th className="py-3 px-4 text-center font-medium">Questões</th>
              <th className="py-3 px-4 text-center font-medium">Importância</th>
              <th className="py-3 px-4 text-center font-medium">Total Exercícios feitos</th>
              <th className="py-3 px-4 text-center font-medium">Acertos</th>
              <th className="py-3 px-4 text-center font-medium">Erros</th>
              <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
            </tr>
          </thead>
          <tbody>
            {subject.topics.map((topic, index) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                index={index}
                subjectId={subject.id}
                performanceGoal={performanceGoal}
                currentUserId={currentUserId}
                onTopicChange={onTopicChange}
                isEditMode={isEditMode}
                importancePercentage={currentImportanceStats.percentage}
                userStats={currentSubjectStats}
              />
            ))}
            <TotalsRow
              topics={subject.topics}
              performanceGoal={performanceGoal}
              currentUserId={currentUserId}
              importancePercentage={currentImportanceStats.percentage}
              userStats={currentSubjectStats}
            />
          </tbody>
        </table>
      </div>
    </div>;
};