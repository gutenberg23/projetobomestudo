import React from "react";
import { DashboardSummary } from "./components/DashboardSummary";
import { SubjectTable } from "./components/SubjectTable";
import { SimuladosTable } from "./components/SimuladosTable";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateOverallStats } from "./utils/statsCalculations";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';
import { useUserProgress } from "@/hooks/use-user-progress";

export const EditorializedView = ({ activeTab = 'edital' }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const realId = extractIdFromFriendlyUrl(courseId || '');
  const { subjects, loading } = useEditorializedData();
  const { progress } = useUserProgress(realId);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Merge the subjects data with any saved progress
  const mergedSubjects = subjects.map(subject => {
    const savedSubjectData = progress?.subjects_data?.[subject.id];
    if (savedSubjectData?.topics) {
      return {
        ...subject,
        topics: subject.topics.map(topic => {
          const savedTopic = savedSubjectData.topics.find(t => t.id === topic.id);
          return savedTopic ? { ...topic, ...savedTopic } : topic;
        })
      };
    }
    return subject;
  });

  return (
    <div className="bg-[#f6f8fa] rounded-[10px] pb-5 px-[10px] md:px-5">
      <DashboardSummary 
        overallStats={calculateOverallStats(mergedSubjects)} 
        activeTab={activeTab}
        subjects={mergedSubjects}
      />

      {activeTab === 'edital' && (
        <>
          <StatisticsCard subjects={mergedSubjects} />
          
          {mergedSubjects.map(subject => (
            <SubjectTable
              key={subject.id}
              subject={subject}
              performanceGoal={progress?.performance_goal || 85}
            />
          ))}
          
          {mergedSubjects.length === 0 && (
            <div className="text-center py-8 text-[#67748a]">
              Nenhuma disciplina encontrada para este edital.
            </div>
          )}
        </>
      )}

      {activeTab === 'simulados' && (
        <SimuladosTable performanceGoal={progress?.performance_goal || 85} />
      )}
    </div>
  );
};
