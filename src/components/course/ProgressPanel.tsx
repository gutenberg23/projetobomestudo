"use client";

import React, { useEffect, useState } from "react";
import { ProgressSummary } from "./components/ProgressSummary";
import { SubjectCard } from "./components/SubjectCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { calculateSubjectTotals, calculateOverallStats } from "./utils/statsCalculations";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserQuestionAttempts, calculateUserQuestionStats, UserQuestionAttempt } from "./utils/userQuestionStats";

interface ProgressPanelProps {
  subjectsFromCourse?: any[];
}

export const ProgressPanel = ({ subjectsFromCourse }: ProgressPanelProps) => {
  const [expandedSubject, setExpandedSubject] = React.useState<string | number | null>(null);
  const { subjects, loading } = useEditorializedData();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [questionAttempts, setQuestionAttempts] = useState<UserQuestionAttempt[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [combinedSubjects, setCombinedSubjects] = useState<any[]>([]);
  
  // Combinar as disciplinas do hook com as disciplinas recebidas do CourseLayout
  useEffect(() => {
    console.log("ProgressPanel - Disciplinas do hook:", subjects.length);
    console.log("ProgressPanel - Disciplinas do CourseLayout:", subjectsFromCourse?.length || 0);
    
    // Se temos disciplinas do CourseLayout, vamos usá-las para enriquecer os dados
    if (subjectsFromCourse && subjectsFromCourse.length > 0) {
      // Mapear as disciplinas do Supabase para o formato esperado pelo ProgressPanel
      const mappedSubjects = subjectsFromCourse.map(disciplina => {
        // Tentar encontrar a disciplina correspondente nos dados do hook
        const matchingSubject = subjects.find(s => s.id === disciplina.id);
        
        if (matchingSubject) {
          // Se encontrou, usar os dados do hook que já têm as estatísticas
          return matchingSubject;
        } else {
          // Se não encontrou, criar uma versão básica com os dados do Supabase
          return {
            id: disciplina.id,
            name: disciplina.titulo,
            topics: [],
            // Valores padrão para as estatísticas
            stats: {
              exercisesDone: 0,
              hits: 0,
              errors: 0,
              completedTopics: 0,
              totalTopics: 0
            }
          };
        }
      });
      
      console.log("ProgressPanel - Disciplinas combinadas:", mappedSubjects.length);
      setCombinedSubjects(mappedSubjects);
    } else {
      // Se não temos disciplinas do CourseLayout, usar apenas as do hook
      setCombinedSubjects(subjects);
    }
  }, [subjects, subjectsFromCourse]);
  
  // Buscar as tentativas de questões do usuário
  useEffect(() => {
    const loadQuestionAttempts = async () => {
      if (userId === 'guest') {
        setQuestionAttempts([]);
        setStatsLoading(false);
        return;
      }
      
      try {
        const attempts = await fetchUserQuestionAttempts(userId);
        setQuestionAttempts(attempts);
      } catch (error) {
        console.error('Erro ao carregar tentativas de questões:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadQuestionAttempts();
  }, [userId]);
  
  if (loading || statsLoading) {
    return (
      <div className="bg-white rounded-[10px] space-y-4 p-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  // Calcular estatísticas com base nas disciplinas combinadas
  const displaySubjects = combinedSubjects.length > 0 ? combinedSubjects : subjects;
  const overallStats = calculateOverallStats(displaySubjects);
  const questionStats = calculateUserQuestionStats(questionAttempts);
  
  // Calcular o percentual de progresso
  const progressPercentage = overallStats.totalTopics > 0
    ? Math.round((overallStats.completedTopics / overallStats.totalTopics) * 100)
    : 0;
  
  // Combinar estatísticas de questões e tópicos
  const totalQuestions = questionStats.totalQuestions;
  const totalCorrectAnswers = questionStats.correctAnswers;
  const totalWrongAnswers = questionStats.wrongAnswers;
  
  const toggleExpand = (subjectId: string | number) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };
  
  return (
    <div className="bg-white rounded-[10px] p-5 space-y-5">
      <h2 className="text-xl font-semibold text-[rgba(38,47,60,1)]">Seu progresso</h2>
      
      <ProgressSummary
        totalCompletedSections={overallStats.completedTopics}
        totalSections={overallStats.totalTopics}
        progressPercentage={progressPercentage}
        totalQuestions={totalQuestions}
        totalCorrectAnswers={totalCorrectAnswers}
        totalWrongAnswers={totalWrongAnswers}
      />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[rgba(38,47,60,1)]">Disciplinas</h3>
        
        {displaySubjects.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhuma disciplina disponível.
          </div>
        ) : (
          displaySubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isExpanded={expandedSubject === subject.id}
              onToggle={() => toggleExpand(subject.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
