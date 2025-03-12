
import React, { useState } from "react";
import { DashboardSummary } from "./components/DashboardSummary";
import { SubjectTable } from "./components/SubjectTable";
import { SimuladosTable } from "./components/SimuladosTable";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { Skeleton } from "@/components/ui/skeleton";

export const EditorializedView = ({ activeTab = 'edital' }) => {
  const [performanceGoal, setPerformanceGoal] = useState<number>(70);
  const { subjects, loading, updateTopicProgress } = useEditorializedData();

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8fa] rounded-[10px] pb-5 px-[10px] md:px-5">
      <DashboardSummary 
        overallStats={calculateOverallStats(subjects)} 
        performanceGoal={performanceGoal} 
        setPerformanceGoal={setPerformanceGoal}
        activeTab={activeTab}
        subjects={subjects}
      />

      {activeTab === 'edital' && (
        <>
          <StatisticsCard subjects={subjects} />
          
          {subjects.map(subject => (
            <SubjectTable
              key={subject.id}
              subject={subject}
              performanceGoal={performanceGoal}
              onTopicChange={updateTopicProgress}
            />
          ))}
          
          {subjects.length === 0 && (
            <div className="text-center py-8 text-[#67748a]">
              Nenhuma disciplina encontrada para este edital.
            </div>
          )}
        </>
      )}

      {activeTab === 'simulados' && (
        <SimuladosTable performanceGoal={performanceGoal} />
      )}
    </div>
  );
};
