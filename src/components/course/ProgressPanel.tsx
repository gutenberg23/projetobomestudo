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

  // Função para contar os tópicos das aulas
  const countTopicsInSubjects = async (subjectsData: any[]) => {
    if (!subjectsData || !Array.isArray(subjectsData) || subjectsData.length === 0) {
      return { totalTopics: 0, completedTopics: 0 };
    }
    
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;
    
    for (const subject of subjectsData) {
      if (subject.lessons && Array.isArray(subject.lessons)) {
        for (const lesson of subject.lessons) {
          if (lesson.sections && Array.isArray(lesson.sections)) {
            totalTopicsCount += lesson.sections.length;
            completedTopicsCount += lesson.sections.filter((section: any) => 
              section.isActive === true
            ).length;
          }
        }
      }
    }
    
    return { totalTopics: totalTopicsCount, completedTopics: completedTopicsCount };
  };
  
  // Buscar o progresso do curso quando componente é montado
  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !courseId) return;
      
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        const { data: progress, error } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();
          
        if (error) {
          console.error('Erro ao buscar progresso do curso:', error);
          return;
        }
        
        if (progress && progress.subjects_data) {
          console.log('Dados completos do progresso:', progress.subjects_data);
          
          let totalCompleted = 0;
          let totalTopics = 0;
          
          // Verificar se subjects_data é um objeto e possui completed_sections
          const subjectsData = progress.subjects_data as SubjectsData;
          
          if (subjectsData && typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
            if (subjectsData.completed_sections) {
              // Verificar se completed_sections é um objeto antes de contabilizar
              const completedSections = subjectsData.completed_sections;
              
              if (completedSections && typeof completedSections === 'object') {
                // Contar todos os tópicos concluídos em todas as aulas
                Object.values(completedSections).forEach(sections => {
                  if (Array.isArray(sections)) {
                    totalCompleted += sections.length;
                  }
                });
                
                console.log('Total de tópicos concluídos contabilizados:', totalCompleted);
              }
            }
          }
          
          // Buscar o curso para obter as aulas
          const { data: cursoData, error: cursoError } = await supabase
            .from('cursos')
            .select('aulas_ids')
            .eq('id', realCourseId)
            .single();
            
          if (cursoError) {
            console.error('Erro ao buscar aulas do curso:', cursoError);
          } else if (cursoData?.aulas_ids && cursoData.aulas_ids.length > 0) {
            // Buscar todas as aulas do curso para contar seus tópicos
            const { data: aulasData, error: aulasError } = await supabase
              .from('aulas')
              .select('topicos_ids')
              .in('id', cursoData.aulas_ids);
              
            if (aulasError) {
              console.error('Erro ao buscar detalhes das aulas:', aulasError);
            } else {
              // Contar o total de tópicos em todas as aulas
              if (aulasData && Array.isArray(aulasData)) {
                totalTopics = aulasData.reduce((sum, aula) => {
                  const topicoCount = Array.isArray(aula.topicos_ids) ? aula.topicos_ids.length : 0;
                  return sum + topicoCount;
                }, 0);
                
                console.log('Total de tópicos encontrados:', totalTopics);
              }
            }
          }
          
          // Atualizar as estatísticas de tópicos
          setTopicsStats({
            totalTopics: totalTopics || 0,
            completedTopics: totalCompleted || 0
          });
          
          console.log('Estatísticas atualizadas:', { totalTopics, totalCompleted });
        }
      } catch (error) {
        console.error('Erro ao processar progresso do curso:', error);
      }
    };
    
    loadProgress();
  }, [user, courseId]);
  
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
        setTopicsStats(prev => ({
          ...prev,
          ...stats
        }));
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
              
              // Verificar e processar os dados de progresso
              if (data[0].subjects_data) {
                const subjectsData = data[0].subjects_data as SubjectsData;
                
                // Disponibilizar os dados para uso global - usar o registro mais recente
                (window as any).userCourseProgress = data[0];
                
                // Verificar se temos dados de tópicos completados
                if (typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
                  if (subjectsData.completed_sections) {
                    let totalCompleted = 0;
                    
                    // Iterar sobre todas as aulas que possuem seções concluídas
                    Object.values(subjectsData.completed_sections).forEach((sections: any) => {
                      if (Array.isArray(sections)) {
                        totalCompleted += sections.length;
                      }
                    });
                    
                    // Atualizar o estado apenas se houver dados válidos
                    if (totalCompleted > 0) {
                      setTopicsStats(prev => ({
                        ...prev,
                        completedTopics: totalCompleted
                      }));
                      
                      console.log('Total de tópicos concluídos atualizado:', totalCompleted);
                    }
                  }
                }
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
    
    // Adicionar evento personalizado para quando uma questão for respondida
    window.addEventListener('questionAnswered', handleQuestionAnswered);
    
    // Adicionar evento personalizado para conclusão de tópicos
    document.addEventListener('topicCompleted', handleQuestionAnswered);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('questionAnswered', handleQuestionAnswered);
      document.removeEventListener('topicCompleted', handleQuestionAnswered);
    };
  }, [userId]);
  
  // Escutar eventos de atualização de seções
  useEffect(() => {
    const handleSectionsUpdated = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) {
        console.log("Evento sectionsUpdated recebido no ProgressPanel:", detail);
      }
    };
    
    document.addEventListener('sectionsUpdated', handleSectionsUpdated);
    
    return () => {
      document.removeEventListener('sectionsUpdated', handleSectionsUpdated);
    };
  }, []);
  
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
  
  // Adicionar um log para verificar a estrutura dos subjects
  console.log("Estrutura dos subjects:", displaySubjects);
  console.log("Estatísticas de tópicos:", {totalTopics, completedTopics});
  
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
          
          if (userCourseProgress && userCourseProgress.subjects_data) {
            const subjectsData = userCourseProgress.subjects_data as SubjectsData;
            
            if (typeof subjectsData === 'object' && !Array.isArray(subjectsData) && 
                subjectsData[subject.id]) {
              const subjectData = subjectsData[subject.id];
              console.log(`Dados do progresso para disciplina ${subject.name || subject.titulo}:`, subjectData);
              
              // Tentar extrair estatísticas dos dados de progresso
              if (subjectData && typeof subjectData === 'object' && subjectData.stats) {
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
  
  // Log para verificar os valores que serão passados
  console.log("Valores finais para ProgressSummary no ProgressPanel:", {
    totalQuestions,
    totalCorrectAnswers,
    totalWrongAnswers,
    completedTopics,
    totalTopics,
    progressPercentage
  });
  
  const toggleExpand = (subjectId: string | number) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };
  
  if (loading || statsLoading || progressLoading) {
    return (
      <div className="bg-white rounded-[10px] space-y-4 p-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-[10px] p-5 space-y-5 border-l border-[#efefef]">
      <h2 className="text-xl font-semibold text-[rgba(38,47,60,1)]">Meu progresso</h2>
      
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
          <div className="max-h-[400px] overflow-y-auto pr-2 
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-[#f6f8fa]
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-[#5f2ebe]/30
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:hover:bg-[#5f2ebe]/50
            [&::-webkit-scrollbar-thumb]:transition-colors
            [&::-webkit-scrollbar-thumb]:duration-200
          ">
            {displaySubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isExpanded={expandedSubject === subject.id}
                onToggle={() => toggleExpand(subject.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
