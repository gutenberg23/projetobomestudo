
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
  const [topicsStats, setTopicsStats] = useState({
    totalTopics: 0,
    completedTopics: 0
  });
  
  // Função para contar os tópicos das aulas
  const countTopicsInSubjects = async (subjectsData: any[]) => {
    if (!subjectsData || !Array.isArray(subjectsData) || subjectsData.length === 0) {
      return { totalTopics: 0, completedTopics: 0 };
    }
    
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;
    
    // Primeiro, tentamos contar usando a nova estrutura (disciplinas -> lessons -> sections)
    for (const subject of subjectsData) {
      if (subject.lessons && Array.isArray(subject.lessons)) {
        for (const lesson of subject.lessons) {
          if (lesson.sections && Array.isArray(lesson.sections)) {
            // Cada seção é um tópico
            totalTopicsCount += lesson.sections.length;
            
            // Contar tópicos completados
            completedTopicsCount += lesson.sections.filter((section: any) => 
              section.isActive === true
            ).length;
          }
        }
      }
    }
    
    // Se não encontramos tópicos na estrutura nova, tentamos a estrutura antiga
    if (totalTopicsCount === 0) {
      // Tentar a estrutura de edital verticalizado (disciplinas -> topics)
      for (const subject of subjectsData) {
        if (subject.topics && Array.isArray(subject.topics)) {
          totalTopicsCount += subject.topics.length;
          completedTopicsCount += subject.topics.filter((topic: any) => topic.isDone).length;
        }
      }
    }
    
    // Verificar se temos dados no progresso do usuário
    if (user && user.id) {
      try {
        const { data: userProgress, error } = await supabase
          .from('user_course_progress')
          .select('subjects_data')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!error && userProgress?.subjects_data) {
          // Verificar se temos informações sobre seções completadas
          const subjectsData = userProgress.subjects_data;
          if (subjectsData.completed_sections) {
            // Somar todas as seções completadas em todas as aulas
            let sectionsCount = 0;
            for (const lessonId in subjectsData.completed_sections) {
              sectionsCount += subjectsData.completed_sections[lessonId].length;
            }
            if (sectionsCount > 0) {
              completedTopicsCount = Math.max(completedTopicsCount, sectionsCount);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar progresso do usuário:', error);
      }
    }
    
    console.log(`Contagem de tópicos: Total=${totalTopicsCount}, Completados=${completedTopicsCount}`);
    return { totalTopics: totalTopicsCount, completedTopics: completedTopicsCount };
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
      
      // Contar tópicos quando os subjects mudam
      (async () => {
        const stats = await countTopicsInSubjects(subjectsFromCourse);
        setTopicsStats(stats);
      })();
    } else {
      // Se não temos disciplinas do CourseLayout, usar apenas as do hook
      setCombinedSubjects(subjects);
    }
  }, [subjects, subjectsFromCourse]);
  
  // Buscar as tentativas de questões do usuário e o progresso do curso
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
        
        // Buscar progresso do curso do Supabase
        if (userId && userId !== 'guest') {
          try {
            // Buscar todos os registros de progresso para este usuário
            const { data, error } = await supabase
              .from('user_course_progress')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (data && data.length > 0 && !error) {
              console.log('Dados de progresso do usuário carregados do Supabase:', data[0]);
              // Disponibilizar os dados para uso global - usar o registro mais recente
              (window as any).userCourseProgress = data[0];
              
              // Atualizar as estatísticas de tópicos
              if (subjectsFromCourse && subjectsFromCourse.length > 0) {
                const stats = await countTopicsInSubjects(subjectsFromCourse);
                setTopicsStats(stats);
              }
            } else if (error) {
              console.error('Erro ao carregar progresso do usuário:', error);
            }
          } catch (error) {
            console.error('Erro ao carregar progresso do usuário:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadUserData();
    
    // Adicionar listener para atualizar quando uma nova questão for respondida
    const handleQuestionAnswered = () => {
      console.log("Evento de questão respondida detectado, atualizando estatísticas...");
      loadUserData();
    };
    
    // Atualizar quando um tópico for marcado como concluído
    const handleTopicCompleted = () => {
      console.log("Evento de tópico concluído detectado, atualizando estatísticas...");
      if (subjectsFromCourse && subjectsFromCourse.length > 0) {
        (async () => {
          const stats = await countTopicsInSubjects(subjectsFromCourse);
          setTopicsStats(stats);
        })();
      }
    };
    
    // Adicionar evento personalizado para quando uma questão for respondida
    window.addEventListener('questionAnswered', handleQuestionAnswered);
    window.addEventListener('topicCompleted', handleTopicCompleted);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('questionAnswered', handleQuestionAnswered);
      window.removeEventListener('topicCompleted', handleTopicCompleted);
    };
  }, [userId, subjectsFromCourse]);
  
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
  
  // Calcular o percentual de progresso usando a contagem de tópicos
  const progressPercentage = topicsStats.totalTopics > 0
    ? Math.round((topicsStats.completedTopics / topicsStats.totalTopics) * 100)
    : 0;
  
  // Adicionar um log para verificar a estrutura dos subjects
  console.log("Estrutura dos subjects:", displaySubjects);
  console.log("Estatísticas de tópicos:", topicsStats);
  
  // Função para garantir que estamos usando números válidos para os cálculos
  const ensureValidNumber = (value: any): number => {
    // Se o valor for undefined, null ou NaN, retornar 0
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return !isNaN(num) ? num : 0;
  };
  
  // Inicializar variáveis para armazenar os totais
  let totalCorrectFromSubjects = 0;
  let totalWrongFromSubjects = 0;
  
  // Verificar se temos subjects para processar
  if (displaySubjects && displaySubjects.length > 0) {
    displaySubjects.forEach(subject => {
      // Verificar se o subject tem as propriedades específicas de estatísticas
      // Estas propriedades são definidas pelo método getSubjectStats no SubjectCard
      if (subject.questionsTotal !== undefined && 
          subject.questionsCorrect !== undefined && 
          subject.questionsWrong !== undefined) {
        
        const correctAnswers = ensureValidNumber(subject.questionsCorrect);
        const wrongAnswers = ensureValidNumber(subject.questionsWrong);
        
        console.log(`Disciplina ${subject.name || subject.titulo}:`, {
          questionsTotal: subject.questionsTotal,
          questionsCorrect: correctAnswers,
          questionsWrong: wrongAnswers
        });
        
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
          
          console.log(`Disciplina ${subject.name || subject.titulo} (stats):`, {
            exercisesDone: subject.stats.exercisesDone,
            hits: hits,
            errors: errors
          });
          
          // Somamos diretamente os acertos e erros
          totalCorrectFromSubjects += hits;
          totalWrongFromSubjects += errors;
        }
      }
      // Verificar dados de progresso do Supabase
      else if (subject.id) {
        // Tentar buscar dados do progresso do usuário
        try {
          // Verificar se temos dados de progresso do usuário
          const userCourseProgress = (window as any).userCourseProgress;
          
          if (userCourseProgress && userCourseProgress.subjects_data && userCourseProgress.subjects_data[subject.id]) {
            const subjectData = userCourseProgress.subjects_data[subject.id];
            console.log(`Dados do progresso para disciplina ${subject.name || subject.titulo}:`, subjectData);
            
            // Tentar extrair estatísticas dos dados de progresso
            if (subjectData.stats) {
              const hits = ensureValidNumber(subjectData.stats.hits);
              const errors = ensureValidNumber(subjectData.stats.errors);
              
              console.log(`Estatísticas do progresso para ${subject.name || subject.titulo}:`, {
                hits,
                errors
              });
              
              totalCorrectFromSubjects += hits;
              totalWrongFromSubjects += errors;
            }
          }
        } catch (error) {
          console.error(`Erro ao acessar dados de progresso para disciplina ${subject.id}:`, error);
        }
      }
    });
  } else {
    console.log("Nenhuma disciplina disponível para calcular estatísticas");
  }
  
  console.log("Totais calculados:", {
    totalCorrectFromSubjects,
    totalWrongFromSubjects,
  });
  
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
  
  // Log adicional para verificar os valores finais que serão passados para o ProgressSummary
  console.log("Valores finais para ProgressSummary:", {
    totalQuestions,
    totalCorrectAnswers,
    totalWrongAnswers,
    questionStats
  });
  
  const toggleExpand = (subjectId: string | number) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };
  
  return (
    <div className="bg-white rounded-[10px] p-5 space-y-5">
      <h2 className="text-xl font-semibold text-[rgba(38,47,60,1)]">Seu progresso</h2>
      
      <ProgressSummary
        totalCompletedSections={topicsStats.completedTopics}
        totalSections={topicsStats.totalTopics}
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
