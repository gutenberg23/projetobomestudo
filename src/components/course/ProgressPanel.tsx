
"use client";

import React, { useEffect, useState } from "react";
import { ProgressSummary } from "./components/ProgressSummary";
import { SubjectCard } from "./components/SubjectCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { calculateSubjectTotals, calculateOverallStats } from "./utils/statsCalculations";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserQuestionAttempts, calculateUserQuestionStats, UserQuestionAttempt } from "./utils/userQuestionStats";
import { supabase } from "@/integrations/supabase/client";
import { BookOpenIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { Json } from "@/integrations/supabase/types";
import { useUserProgress } from "./hooks/useUserProgress";

// Interface para a estrutura de dados de subjects_data
interface CompletedSections {
  [lessonId: string]: string[];
}

interface SubjectsData {
  completed_sections?: CompletedSections;
  [key: string]: any;
}

interface ProgressPanelProps {
  subjectsFromCourse?: any[];
}

export const ProgressPanel = ({ subjectsFromCourse }: ProgressPanelProps) => {
  const [expandedSubject, setExpandedSubject] = React.useState<string | number | null>(null);
  const { subjects, loading } = useEditorializedData();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const userId = user?.id || 'guest';
  const [questionAttempts, setQuestionAttempts] = useState<UserQuestionAttempt[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [combinedSubjects, setCombinedSubjects] = useState<any[]>([]);
  const [topicsStats, setTopicsStats] = useState({ totalTopics: 0, completedTopics: 0 });
  
  // Usar o hook personalizado para obter o progresso
  const { totalTopics, completedTopics, progressPercentage, loading: progressLoading } = 
    useUserProgress(user?.id, courseId);
  
  // Função para garantir que estamos usando números válidos para os cálculos
  const ensureValidNumber = (value: any): number => {
    // Se o valor for undefined, null ou NaN, retornar 0
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return !isNaN(num) ? num : 0;
  };

  // Combinar as disciplinas do hook com as disciplinas recebidas do CourseLayout
  useEffect(() => {
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
      
      setCombinedSubjects(mappedSubjects);
    } else {
      // Se não temos disciplinas do CourseLayout, usar apenas as do hook
      setCombinedSubjects(subjects);
    }
  }, [subjects, subjectsFromCourse]);
  
  // Buscar as tentativas de questões do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (userId === 'guest') {
        setQuestionAttempts([]);
        setStatsLoading(false);
        return;
      }
      
      try {
        // Buscar tentativas de questões
        const attempts = await fetchUserQuestionAttempts(userId);
        setQuestionAttempts(attempts);
        setStatsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar tentativas de questões:', error);
        setStatsLoading(false);
      }
    };
    
    loadUserData();
    
    // Adicionar listener para atualizar quando uma nova questão for respondida
    const handleQuestionAnswered = () => {
      console.log("Evento de questão respondida detectado, atualizando estatísticas...");
      loadUserData();
    };
    
    // Adicionar eventos personalizados
    window.addEventListener('questionAnswered', handleQuestionAnswered);
    document.addEventListener('topicCompleted', handleQuestionAnswered);
    document.addEventListener('dataSaved', handleQuestionAnswered);
    
    // Limpar os listeners quando o componente for desmontado
    return () => {
      window.removeEventListener('questionAnswered', handleQuestionAnswered);
      document.removeEventListener('topicCompleted', handleQuestionAnswered);
      document.removeEventListener('dataSaved', handleQuestionAnswered);
    };
  }, [userId]);
  
  if (loading || statsLoading || progressLoading) {
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
  
  // Usar diretamente os valores do hook de progresso
  console.log("Estatísticas de tópicos do hook:", {totalTopics, completedTopics, progressPercentage});
  
  // Inicializar variáveis para armazenar os totais
  let totalCorrectFromSubjects = 0;
  let totalWrongFromSubjects = 0;
  
  // Verificar se temos subjects para processar
  if (displaySubjects && displaySubjects.length > 0) {
    displaySubjects.forEach(subject => {
      // Verificar se o subject tem as propriedades específicas de estatísticas
      if (subject.questionsTotal !== undefined && 
          subject.questionsCorrect !== undefined && 
          subject.questionsWrong !== undefined) {
        
        const correctAnswers = ensureValidNumber(subject.questionsCorrect);
        const wrongAnswers = ensureValidNumber(subject.questionsWrong);
        
        // Somamos diretamente os acertos e erros
        totalCorrectFromSubjects += correctAnswers;
        totalWrongFromSubjects += wrongAnswers;
      }
      // Verificar se o subject tem stats no formato do calculateSubjectTotals
      else if (subject.stats) {
        if (subject.stats.exercisesDone !== undefined && 
            subject.stats.hits !== undefined && 
            subject.stats.errors !== undefined) {
          
          const hits = ensureValidNumber(subject.stats.hits);
          const errors = ensureValidNumber(subject.stats.errors);
          
          // Somamos diretamente os acertos e erros
          totalCorrectFromSubjects += hits;
          totalWrongFromSubjects += errors;
        }
      }
    });
  }
  
  // Verificar se temos dados válidos das disciplinas
  let totalCorrectAnswers = 0;
  let totalWrongAnswers = 0;
  
  // Se temos dados das disciplinas, usá-los diretamente
  if (totalCorrectFromSubjects > 0 || totalWrongFromSubjects > 0) {
    totalCorrectAnswers = totalCorrectFromSubjects;
    totalWrongAnswers = totalWrongFromSubjects;
  } 
  // Caso contrário, tentar usar os dados das tentativas de questões
  else if (questionStats.correctAnswers > 0 || questionStats.wrongAnswers > 0) {
    totalCorrectAnswers = questionStats.correctAnswers;
    totalWrongAnswers = questionStats.wrongAnswers;
  }
  
  // Garantir que temos valores válidos
  totalCorrectAnswers = ensureValidNumber(totalCorrectAnswers);
  totalWrongAnswers = ensureValidNumber(totalWrongAnswers);
  
  // O total de questões é a soma de acertos e erros
  const totalQuestions = totalCorrectAnswers + totalWrongAnswers;
  
  const toggleExpand = (subjectId: string | number) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };
  
  return (
    <div className="bg-white rounded-[10px] p-5 space-y-5">
      <h2 className="text-xl font-semibold text-[rgba(38,47,60,1)]">Seu progresso</h2>
      
      <ProgressSummary
        totalCompletedSections={completedTopics}
        totalSections={totalTopics}
        progressPercentage={progressPercentage}
        totalQuestions={totalQuestions}
        totalCorrectAnswers={totalCorrectAnswers}
        totalWrongAnswers={totalWrongAnswers}
      />
      
      <div className="space-y-3">
        <h3 className="text-base font-medium text-[rgba(38,47,60,1)] flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4 text-[#5f2ebe]" />
          Disciplinas
        </h3>
        
        {displaySubjects.length === 0 ? (
          <div className="text-center py-3 text-gray-500 text-sm">
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
