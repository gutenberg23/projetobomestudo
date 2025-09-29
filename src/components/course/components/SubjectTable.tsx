import { useState, useEffect } from "react";
import { Subject, Topic } from "../types/editorialized";
import { calculateSubjectTotals } from "../utils/statsCalculations";
import { supabase } from "@/integrations/supabase/client";
import { TopicRow } from "./TopicRow";
import { TotalsRow } from "./TotalsRow";
import { useSubjectImportanceStats } from "@/hooks/useSubjectImportanceStats";

interface UserStats {
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
}

interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
  isEditMode: boolean;
  subjects: Subject[];
  onSortChange?: (sortBy: 'id' | 'importance') => void;
  sortBy?: 'id' | 'importance'; // Adicionando propriedade para ordenação
}

export const SubjectTable = ({
  subject,
  performanceGoal,
  onTopicChange,
  isEditMode,
  subjects,
  onSortChange,
  sortBy = 'id' // Valor padrão
}: SubjectTableProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const subjectTotals = calculateSubjectTotals(subject.topics);
  const subjectProgress = Math.round(subjectTotals.completedTopics / subjectTotals.totalTopics * 100);
  
  const { importanceStats, userStats, loading } = useSubjectImportanceStats(subjects, currentUserId);

  // Buscar o usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  const currentSubjectStats = userStats[subject.id.toString()] || {
    totalAttempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0
  };

  const currentImportanceStats = importanceStats[subject.id.toString()] || {
    percentage: 0,
    rawCount: 0
  };

  // Função para obter a porcentagem de importância de um tópico específico
  const getTopicImportancePercentage = (topicIndex: number) => {
    const topicKey = `${subject.id}-${topicIndex}`;
    const topicImportanceStats = importanceStats[topicKey];
    return topicImportanceStats ? topicImportanceStats.percentage : 0;
  };

  // Ordenar os tópicos com base no critério de ordenação
  const sortedTopics = [...subject.topics].sort((a, b) => {
    if (sortBy === 'importance') {
      // Ordenar por importância (maior para menor)
      const aImportance = getTopicImportancePercentage(a.id - 1);
      const bImportance = getTopicImportancePercentage(b.id - 1);
      return bImportance - aImportance;
    } else {
      // Ordenar por ID (menor para maior)
      return a.id - b.id;
    }
  });

  if (loading) {
    return <div>Carregando estatísticas...</div>;
  }

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
                importancePercentage={getTopicImportancePercentage(topic.id - 1)}
                userStats={currentSubjectStats}
              />
            ))}
            <TotalsRow
              topics={sortedTopics}
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