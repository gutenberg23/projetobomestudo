import { useState, useEffect } from "react";
import { Subject, Topic } from "../types/editorialized";
import { calculateSubjectTotals } from "../utils/statsCalculations";
import { supabase } from "@/integrations/supabase/client";
import { TopicRow } from "./TopicRow";
import { TotalsRow } from "./TotalsRow";

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
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round(subjectTotals.completedTopics / subjectTotals.totalTopics * 100);

  // Buscar o usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  return <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-between bg-white text-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
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
      <div className="border border-gray-200 rounded-lg mt-2 overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600">
              <th className="py-3 px-4 text-left font-medium w-8">#</th>
              <th className="py-3 px-4 text-left font-medium">Conclusão</th>
              <th className="py-3 px-4 text-left font-medium">Tópicos</th>
              <th className="py-3 px-4 text-center font-medium">Questões</th>
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
              />
            ))}
            <TotalsRow
              topics={subject.topics}
              performanceGoal={performanceGoal}
              currentUserId={currentUserId}
            />
          </tbody>
        </table>
      </div>
    </div>;
};