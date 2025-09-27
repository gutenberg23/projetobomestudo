import { useState, useEffect, useMemo } from "react";
import { Subject, Topic } from "../types/editorialized";
import { calculateSubjectTotals } from "../utils/statsCalculations";
import { supabase } from "@/integrations/supabase/client";
import { TopicRow } from "./TopicRow";
import { TotalsRow } from "./TotalsRow";
import { useQuestionStatsFromLink } from "@/hooks/useQuestionStatsFromLink";
import { useSubjectImportanceStats } from "@/hooks/useSubjectImportanceStats";

interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
  isEditMode: boolean;
  sortOrder: 'id' | 'importance';
  allSubjects: Subject[];
}

export const SubjectTable = ({
  subject,
  performanceGoal,
  onTopicChange,
  isEditMode,
  sortOrder,
  allSubjects
}: SubjectTableProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round(subjectTotals.completedTopics / subjectTotals.totalTopics * 100);
  
  const { importanceStats } = useSubjectImportanceStats(allSubjects, currentUserId);

  // Calcular total de questões de todos os tópicos de todos os assuntos
  const totalQuestionsAllSubjects = useMemo(() => {
    let total = 0;
    allSubjects.forEach(subj => {
      subj.topics.forEach(topic => {
        if (topic.link) {
          // Estimativa baseada no link - será calculado individualmente por cada TopicRow
        }
      });
    });
    return total;
  }, [allSubjects]);

  // Ordenar tópicos baseado na ordem selecionada
  const sortedTopics = useMemo(() => {
    if (sortOrder === 'id') {
      return [...subject.topics].sort((a, b) => a.id - b.id);
    } else {
      // Ordenação por importância - usar os dados reais do hook
      return [...subject.topics].sort((a, b) => {
        const aImportance = importanceStats[a.id]?.percentage || 0;
        const bImportance = importanceStats[b.id]?.percentage || 0;
        return bImportance - aImportance; // Ordem decrescente (mais importante primeiro)
      });
    }
  }, [subject.topics, sortOrder, importanceStats]);

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
              <th className="py-3 px-4 text-center font-medium">Importância</th>
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
            {sortedTopics.map((topic, index) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                index={index}
                subjectId={subject.id}
                performanceGoal={performanceGoal}
                currentUserId={currentUserId}
                onTopicChange={onTopicChange}
                isEditMode={isEditMode}
                allSubjects={allSubjects}
              />
            ))}
            <TotalsRow
              topics={sortedTopics}
              performanceGoal={performanceGoal}
              currentUserId={currentUserId}
              allSubjects={allSubjects}
            />
          </tbody>
        </table>
      </div>
    </div>;
};