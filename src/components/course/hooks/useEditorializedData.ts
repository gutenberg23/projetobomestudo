import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Subject, Topic } from '../types/editorialized';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';
import { useAuth } from "@/contexts/AuthContext";

export const useEditorializedData = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [performanceGoal, setPerformanceGoal] = useState<number>(70);
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);

  // Função para registrar logs com timestamp
  const logWithTimestamp = useCallback((message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] ${message}:`, data);
    } else {
      console.log(`[${timestamp}] ${message}`);
    }
  }, []);

  useEffect(() => {
    if (!courseId) return;
    
    const loadData = async () => {
      logWithTimestamp(`Carregando dados do edital. Trigger: ${refreshTrigger}`);
      await fetchEditorializedData();
    };
    
    loadData();
  }, [courseId, userId, refreshTrigger, logWithTimestamp]);

  // Verificar status da sessão periodicamente
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          logWithTimestamp('Erro ao verificar sessão', error);
        } else if (data.session) {
          logWithTimestamp('Sessão válida encontrada', { 
            userId: data.session.user.id,
            expiresAt: data.session.expires_at
          });
        } else {
          logWithTimestamp('Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        logWithTimestamp('Exceção ao verificar sessão', error);
      }
    };

    // Verificar imediatamente e depois a cada 5 minutos
    checkSession();
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, logWithTimestamp]);

  // Auto-salvar mudanças periodicamente se houver alterações não salvas
  useEffect(() => {
    if (userId === 'guest' || !unsavedChanges || !courseId) return;

    const autoSaveTimeout = setTimeout(() => {
      logWithTimestamp('Iniciando auto-save de alterações não salvas');
      saveAllDataToDatabase();
    }, 60000); // Auto-save a cada 1 minuto se houver mudanças

    return () => clearTimeout(autoSaveTimeout);
  }, [unsavedChanges, userId, courseId]);

  const fetchEditorializedData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const realId = extractIdFromFriendlyUrl(courseId);
      logWithTimestamp('ID do curso extraído', realId);

      // Verificar se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id || 'guest';
      const isAuthenticated = currentUserId !== 'guest';

      logWithTimestamp('Status de autenticação', { isAuthenticated, userId: currentUserId });

      // Buscar dados do edital
      const { data: editalData, error: editalError } = await supabase
        .from('cursoverticalizado')
        .select('*')
        .eq('curso_id', realId)
        .maybeSingle();

      if (editalError) {
        logWithTimestamp('Erro ao buscar dados do edital', editalError);
        throw editalError;
      }

      if (!editalData) {
        logWithTimestamp('Nenhum edital verticalizado encontrado para este curso');
        setSubjects([]);
        setLoading(false);
        return;
      }

      // Buscar disciplinas do edital
      const { data: disciplinas, error: disciplinasError } = await supabase
        .from('disciplinaverticalizada')
        .select('*')
        .in('id', editalData.disciplinas_ids || []);

      if (disciplinasError) {
        logWithTimestamp('Erro ao buscar disciplinas', disciplinasError);
        throw disciplinasError;
      }

      // Se o usuário estiver autenticado, buscar dados personalizados
      let userData = null;
      if (isAuthenticated) {
        const { data: editalUserData, error: userDataError } = await supabase
          .from('edital_verticalizado_data')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('course_id', realId);

        if (userDataError) {
          logWithTimestamp('Erro ao buscar dados do usuário', userDataError);
        } else {
          userData = editalUserData;
          logWithTimestamp('Dados do usuário carregados', userData);
        }

        // Buscar meta de aproveitamento e data da prova
        const { data: progressData } = await supabase
          .from('user_course_progress')
          .select('performance_goal, exam_date')
          .eq('user_id', currentUserId)
          .eq('course_id', realId)
          .maybeSingle();

        if (progressData) {
          if (progressData.performance_goal) {
            setPerformanceGoal(parseInt(progressData.performance_goal.toString()));
          }
          if (progressData.exam_date) {
            setExamDate(new Date(progressData.exam_date));
          }
        }
      }

      // Formatar disciplinas com dados do usuário
      const formattedSubjects = disciplinas.map(disciplina => {
        const userDisciplinaData = userData?.find(d => d.disciplina_id === disciplina.id);
        
        const topics = disciplina.topicos.map((topico: string, index: number) => {
          const userTopicoData = userDisciplinaData?.topicos[index];
          logWithTimestamp(`Carregando dados do tópico ${index + 1}`, userTopicoData);
          
          const topic = {
            id: index + 1,
            name: topico,
            topic: topico,
            isDone: userTopicoData?.isDone || false,
            importance: 1,
            difficulty: userTopicoData?.difficulty || 'normal',
            exercisesDone: userTopicoData?.exercisesDone || userTopicoData?.totalExercises || 0,
            hits: userTopicoData?.hits || userTopicoData?.correctAnswers || 0,
            errors: userTopicoData?.exercisesDone ? userTopicoData.exercisesDone - (userTopicoData.hits || 0) : 0,
            performance: userTopicoData?.hits && userTopicoData?.exercisesDone ? 
              (userTopicoData.hits / userTopicoData.exercisesDone) * 100 : 0,
            totalExercises: userTopicoData?.exercisesDone || userTopicoData?.totalExercises || 0,
            correctAnswers: userTopicoData?.hits || userTopicoData?.correctAnswers || 0,
            isReviewed: userTopicoData?.isReviewed || false
          };
          
          logWithTimestamp(`Tópico ${index + 1} formatado`, topic);
          return topic;
        });

        return {
          id: disciplina.id,
          name: disciplina.titulo,
          topics,
          importance: 1,
          difficulty: 'normal',
          totalExercises: userDisciplinaData?.total_exercicios || 0,
          correctAnswers: userDisciplinaData?.acertos || 0,
          isReviewed: false
        };
      });

      setSubjects(formattedSubjects);
      setUnsavedChanges(false);
      
      if (!isAuthenticated) {
        try {
          localStorage.setItem(`edital_${realId}`, JSON.stringify(formattedSubjects));
        } catch (e) {
          logWithTimestamp('Erro ao salvar no localStorage', e);
        }
      }
    } catch (error) {
      logWithTimestamp('Erro ao buscar dados do edital', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUserDataToDatabase = async (courseRealId: string, subjectsData: Subject[], goal: number, date?: Date): Promise<boolean> => {
    try {
      if (!userId || userId === 'guest') {
        logWithTimestamp("Usuário não autenticado, salvando no localStorage");
        try {
          localStorage.setItem(`edital_${courseRealId}`, JSON.stringify(subjectsData));
          return true;
        } catch (e) {
          logWithTimestamp("Erro ao salvar no localStorage", e);
          return false;
        }
      }

      logWithTimestamp("Iniciando salvamento no banco de dados");

      // Primeiro, salvar os dados do progresso geral do curso
      const { error: progressError } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseRealId,
          performance_goal: goal,
          exam_date: date ? date.toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });

      if (progressError) {
        logWithTimestamp("Erro ao salvar progresso geral", progressError);
        return false;
      }

      // Agora, salvar os dados detalhados de cada disciplina
      for (const subject of subjectsData) {
        const topicosData = subject.topics.map(topic => {
          const data = {
            id: topic.id,
            isDone: topic.isDone || false,
            difficulty: topic.difficulty || 'normal',
            totalExercises: topic.exercisesDone || 0,
            correctAnswers: topic.hits || 0,
            exercisesDone: topic.exercisesDone || 0,
            hits: topic.hits || 0,
            isReviewed: topic.isReviewed || false
          };
          logWithTimestamp(`Salvando dados do tópico ${topic.id}`, data);
          return data;
        });

        logWithTimestamp(`Salvando dados da disciplina ${subject.id}`, {
          topicosData,
          disciplinaId: subject.id.toString()
        });

        const { error: editalError } = await supabase
          .from('edital_verticalizado_data')
          .upsert({
            user_id: userId,
            course_id: courseRealId,
            disciplina_id: subject.id.toString(),
            topicos: topicosData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,course_id,disciplina_id'
          });

        if (editalError) {
          logWithTimestamp(`Erro ao salvar dados da disciplina ${subject.id}`, editalError);
          return false;
        }
      }

      logWithTimestamp("Todos os dados foram salvos com sucesso");
      setUnsavedChanges(false);
      return true;
    } catch (error) {
      logWithTimestamp("Erro ao salvar dados", error);
      return false;
    }
  };

  const forceRefresh = async () => {
    logWithTimestamp("Forçando recarregamento dos dados do edital verticalizado");
    
    setSubjects([]);
    
    if (courseId) {
      const realId = extractIdFromFriendlyUrl(courseId);
      try {
        localStorage.removeItem(`edital_${realId}`);
        logWithTimestamp(`Cache do localStorage para edital_${realId} removido durante forceRefresh`);
      } catch (e) {
        logWithTimestamp("Erro ao remover dados do localStorage", e);
      }
    }
    
    setRefreshTrigger(prev => prev + 1);
    setLoading(true);
  };

  const updateTopicProgress = async (
    subjectId: string | number,
    topicId: number,
    field: keyof Topic,
    value: any
  ) => {
    try {
      logWithTimestamp("Atualizando progresso do tópico", {
        subjectId,
        topicId,
        field,
        value
      });
      
      setSubjects(prevSubjects => {
        const updatedSubjects = prevSubjects.map(subject => {
          if (subject.id === subjectId) {
            return {
              ...subject,
              topics: subject.topics.map(topic => {
                if (topic.id === topicId) {
                  switch (field) {
                    case 'exercisesDone':
                      return {
                        ...topic,
                        exercisesDone: value,
                        totalExercises: value
                      };
                    case 'hits':
                      return {
                        ...topic,
                        hits: value,
                        correctAnswers: value
                      };
                    default:
                      return {
                        ...topic,
                        [field]: value
                      };
                  }
                }
                return topic;
              })
            };
          }
          return subject;
        });
        
        if (userId === 'guest' && courseId) {
          const realId = extractIdFromFriendlyUrl(courseId);
          try {
            localStorage.setItem(`edital_${realId}`, JSON.stringify(updatedSubjects));
            logWithTimestamp("Dados atualizados salvos no localStorage");
          } catch (error) {
            logWithTimestamp("Erro ao salvar no localStorage", error);
          }
        } else {
          // Se mudou o valor de isDone, exercisesDone ou hits, salvamos automaticamente
          if (field === 'isDone' || field === 'exercisesDone' || field === 'hits') {
            logWithTimestamp(`Campo ${field} modificado, salvando automaticamente`);
            // Vamos salvar com um pequeno delay para permitir que a UI seja atualizada primeiro
            setTimeout(() => {
              if (courseId) {
                const realId = extractIdFromFriendlyUrl(courseId);
                saveUserDataToDatabase(realId, updatedSubjects, performanceGoal, examDate);
              }
            }, 500);
          }
        }
        
        setUnsavedChanges(true);
        logWithTimestamp("Mudanças detectadas, setUnsavedChanges(true)");
        
        return updatedSubjects;
      });
    } catch (error) {
      logWithTimestamp("Erro ao atualizar progresso", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    }
  };

  const updatePerformanceGoal = (value: number) => {
    if (value !== performanceGoal) {
      logWithTimestamp("Atualizando meta de aproveitamento", { 
        oldValue: performanceGoal, 
        newValue: value 
      });
      setPerformanceGoal(value);
      setUnsavedChanges(true);
      logWithTimestamp("Meta de aproveitamento modificada, marcando unsavedChanges como true");
    }
  };

  const updateExamDate = (date: Date | undefined) => {
    logWithTimestamp("Atualizando data da prova", { 
      oldValue: examDate?.toISOString(), 
      newValue: date?.toISOString() 
    });
    
    if (date?.toISOString() !== examDate?.toISOString()) {
      setExamDate(date);
      setUnsavedChanges(true);
      logWithTimestamp("Data da prova modificada, marcando unsavedChanges como true");
    }
  };

  const saveAllDataToDatabase = async (): Promise<boolean> => {
    if (userId === 'guest' || !courseId) {
      logWithTimestamp("Tentativa de salvar todos os dados, mas usuário é guest ou courseId não existe", {
        userId,
        courseId
      });
      return false;
    }
    
    try {
      logWithTimestamp("Iniciando processo de salvar todos os dados");
      setLoading(true);
      const realId = extractIdFromFriendlyUrl(courseId);
      logWithTimestamp("ID do curso extraído", realId);
      
      const result = await saveUserDataToDatabase(realId, subjects, performanceGoal, examDate);
      setLoading(false);
      
      if (result) {
        logWithTimestamp("Todos os dados salvos com sucesso");
        setUnsavedChanges(false);
        
        // Atualizar a hora do último salvamento
        const now = new Date().toISOString();
        setLastSaveTime(now);
        
        // Mostrar notificação de sucesso com timestamp
        toast({
          title: "Dados salvos",
          description: `Dados salvos com sucesso às ${new Date().toLocaleTimeString()}`,
          variant: "default"
        });
      } else {
        logWithTimestamp("Falha ao salvar todos os dados");
        
        // Tentar renovar a sessão e salvar novamente
        try {
          logWithTimestamp("Tentando renovar sessão antes de tentar salvar novamente");
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            logWithTimestamp("Erro ao renovar sessão antes do segundo salvamento", error);
          } else if (data.session) {
            logWithTimestamp("Sessão renovada com sucesso, tentando salvar novamente");
            const secondAttempt = await saveUserDataToDatabase(realId, subjects, performanceGoal, examDate);
            
            if (secondAttempt) {
              logWithTimestamp("Segunda tentativa de salvamento bem sucedida");
              setUnsavedChanges(false);
              return true;
            } else {
              logWithTimestamp("Segunda tentativa de salvamento falhou");
            }
          }
        } catch (refreshError) {
          logWithTimestamp("Exceção ao tentar renovar sessão", refreshError);
        }
      }
      
      return result;
    } catch (error) {
      logWithTimestamp("Erro ao salvar todos os dados", error);
      setLoading(false);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados no banco de dados.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    subjects,
    loading,
    updateTopicProgress,
    forceRefresh,
    saveAllDataToDatabase,
    unsavedChanges,
    setUnsavedChanges,
    performanceGoal,
    updatePerformanceGoal,
    examDate,
    updateExamDate,
    lastSaveTime
  };
};
