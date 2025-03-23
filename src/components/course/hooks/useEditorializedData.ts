
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
      
      try {
        let sessionValid = false;
        let currentUserId = 'guest';
        
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            logWithTimestamp("Erro ao verificar sessão", sessionError);
            sessionValid = false;
          } else if (sessionData.session) {
            sessionValid = true;
            currentUserId = sessionData.session.user.id;
            logWithTimestamp("Sessão válida", { 
              userId: currentUserId, 
              expiresAt: sessionData.session.expires_at 
            });
          } else {
            logWithTimestamp("Nenhuma sessão ativa encontrada");
            sessionValid = false;
          }
        } catch (sessionCheckError) {
          logWithTimestamp("Erro ao obter sessão", sessionCheckError);
          sessionValid = false;
        }
        
        logWithTimestamp("Usuário atual", currentUserId);
        
        logWithTimestamp('Buscando dados do edital verticalizado');
        
        try {
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
          
          logWithTimestamp('Dados do edital encontrados', editalData);
          
          let disciplinasData: any[] = [];
          
          if (editalData.disciplinas_ids && Array.isArray(editalData.disciplinas_ids)) {
            const { data: disciplinas, error: disciplinasError } = await supabase
              .from('disciplinaverticalizada')
              .select('*')
              .in('id', editalData.disciplinas_ids);
              
            if (disciplinasError) {
              logWithTimestamp('Erro ao buscar disciplinas', disciplinasError);
              throw disciplinasError;
            }
            
            if (disciplinas && disciplinas.length > 0) {
              disciplinasData = disciplinas;
              logWithTimestamp('Disciplinas encontradas', disciplinas.length);
            } else {
              logWithTimestamp('Nenhuma disciplina encontrada para o edital');
            }
          }
          
          const formattedSubjects = formatSubjectsFromEdital(disciplinasData);
          logWithTimestamp('Total de disciplinas formatadas', formattedSubjects.length);
          
          if (currentUserId !== 'guest' && sessionValid) {
            try {
              const { data: progressData, error: progressError } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', currentUserId)
                .eq('course_id', realId)
                .maybeSingle();
              
              logWithTimestamp('Dados de progresso do usuário recebidos', progressData);
              
              if (progressError) {
                logWithTimestamp('Erro ao buscar dados de progresso', progressError);
              } else if (progressData && progressData.subjects_data) {
                try {
                  // Obtenha a data e hora da última atualização
                  const lastUpdated = progressData.updated_at;
                  logWithTimestamp('Última atualização dos dados no servidor', lastUpdated);
                  setLastSaveTime(lastUpdated);
                  
                  // Converter para string JSON e de volta para evitar referências
                  const savedProgress = JSON.parse(JSON.stringify(progressData.subjects_data));
                  
                  if (Array.isArray(savedProgress) && savedProgress.length > 0) {
                    logWithTimestamp('Mesclando dados de progresso com dados do edital');
                    
                    const mergedSubjects = formattedSubjects.map(subject => {
                      const savedSubject = savedProgress.find((s: any) => s.id === subject.id);
                      if (savedSubject) {
                        const mergedTopics = subject.topics.map(topic => {
                          const savedTopic = savedSubject.topics?.find((t: any) => t.id === topic.id);
                          return savedTopic ? { ...topic, ...savedTopic } : topic;
                        });
                        
                        return { ...subject, ...savedSubject, topics: mergedTopics };
                      }
                      return subject;
                    });
                    
                    logWithTimestamp('Dados mesclados com sucesso');
                    setSubjects(mergedSubjects);
                    
                    // Carregar meta de aproveitamento e data da prova do banco de dados
                    if (progressData.performance_goal) {
                      const goalValue = parseInt(progressData.performance_goal.toString());
                      logWithTimestamp('Meta de aproveitamento carregada', goalValue);
                      setPerformanceGoal(goalValue);
                    }
                    
                    if (progressData.exam_date) {
                      const examDateValue = new Date(progressData.exam_date);
                      logWithTimestamp('Data da prova carregada', examDateValue);
                      setExamDate(examDateValue);
                    }
                    
                    setUnsavedChanges(false);
                    setLoading(false);
                    return;
                  } else {
                    logWithTimestamp('Dados de progresso vazios ou em formato inválido', savedProgress);
                  }
                } catch (e) {
                  logWithTimestamp('Erro ao mesclar dados de progresso', e);
                }
              } else {
                logWithTimestamp('Nenhum dado de progresso encontrado para este usuário e curso');
              }
            } catch (e) {
              logWithTimestamp('Erro ao buscar dados de progresso', e);
            }
          }
          
          setSubjects(formattedSubjects);
          setUnsavedChanges(false);
          
          if (currentUserId === 'guest') {
            try {
              localStorage.setItem(`edital_${realId}`, JSON.stringify(formattedSubjects));
              logWithTimestamp('Dados salvos no localStorage para usuário não logado');
            } catch (localStorageError) {
              logWithTimestamp('Erro ao salvar no localStorage', localStorageError);
            }
          }
        } catch (error) {
          logWithTimestamp('Erro ao buscar dados do edital', error);
          
          if (currentUserId === 'guest') {
            try {
              const savedData = localStorage.getItem(`edital_${realId}`);
              if (savedData) {
                const parsedData = JSON.parse(savedData);
                logWithTimestamp('Dados carregados do localStorage após erro', { dataLength: parsedData.length });
                setSubjects(parsedData);
              } else {
                logWithTimestamp('Nenhum dado encontrado no localStorage');
                setSubjects([]);
              }
            } catch (localStorageError) {
              logWithTimestamp('Erro ao carregar dados do localStorage', localStorageError);
              setSubjects([]);
            }
          } else {
            setSubjects([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        logWithTimestamp('Erro ao carregar dados do edital', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do edital. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setLoading(false);
        setSubjects([]);
      }
    } catch (error) {
      logWithTimestamp('Erro ao carregar dados do edital', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do edital. Tente novamente mais tarde.",
        variant: "destructive"
      });
      setLoading(false);
      setSubjects([]);
    }
  };

  const formatSubjectsFromEdital = (disciplinas: any[]): Subject[] => {
    if (!Array.isArray(disciplinas)) {
      logWithTimestamp('Dados de disciplinas não são um array', disciplinas);
      return [];
    }
    
    return disciplinas.map((disciplina) => {
      const isVerticalizada = 'topicos' in disciplina;
      
      return {
        id: disciplina.id,
        name: disciplina.titulo,
        rating: disciplina.descricao || "",
        topics: isVerticalizada && Array.isArray(disciplina.topicos) 
          ? disciplina.topicos.map((topico: string, topicIndex: number) => {
              return {
                id: topicIndex,
                name: topico,
                topic: topico,
                isDone: false,
                isReviewed: false,
                importance: (Array.isArray(disciplina.importancia) && disciplina.importancia[topicIndex] 
                  ? disciplina.importancia[topicIndex] 
                  : 50),
                link: (Array.isArray(disciplina.links) && disciplina.links[topicIndex]) 
                  ? disciplina.links[topicIndex] 
                  : "",
                difficulty: "Médio",
                exercisesDone: 0,
                hits: 0,
                errors: 0,
                performance: 0
              };
            }) 
          : []
      };
    });
  };

  const saveUserDataToDatabase = async (courseRealId: string, subjectsData: Subject[], goal: number, date?: Date): Promise<boolean> => {
    if (userId === 'guest') {
      logWithTimestamp('Tentativa de salvar dados com usuário guest');
      return false;
    }
    
    logWithTimestamp("Tentando salvar dados no banco de dados", {
      courseId: courseRealId,
      userId,
      subjectsCount: subjectsData.length,
      goal,
      date: date?.toISOString()
    });
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logWithTimestamp("Erro ao verificar sessão", sessionError);
        
        // Tentar renovar a sessão em caso de erro
        try {
          logWithTimestamp("Tentando renovar sessão");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            logWithTimestamp("Erro ao renovar sessão", refreshError);
            return false;
          }
          
          if (!refreshData.session) {
            logWithTimestamp("Não foi possível renovar a sessão");
            return false;
          }
          
          logWithTimestamp("Sessão renovada com sucesso", {
            userId: refreshData.session.user.id,
            expiresAt: refreshData.session.expires_at
          });
        } catch (refreshError) {
          logWithTimestamp("Exceção ao renovar sessão", refreshError);
          return false;
        }
      }
      
      if (!sessionData?.session) {
        logWithTimestamp("Sessão inválida, não é possível salvar dados no banco");
        return false;
      }
      
      const { data: existingData, error: existingError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .maybeSingle();
      
      if (existingError && existingError.code !== 'PGRST116') {
        logWithTimestamp("Erro ao verificar dados existentes", existingError);
        return false;
      }
      
      const currentTime = new Date().toISOString();
      let result;
      
      if (existingData) {
        logWithTimestamp("Atualizando registro existente", {
          recordId: existingData.id,
          lastUpdate: existingData.updated_at
        });
        
        result = await supabase
          .from('user_course_progress')
          .update({
            subjects_data: subjectsData,
            performance_goal: goal,
            exam_date: date ? date.toISOString() : null,
            updated_at: currentTime
          })
          .eq('user_id', userId)
          .eq('course_id', courseRealId);
          
        logWithTimestamp("Resultado da atualização", result);
      } else {
        logWithTimestamp("Criando novo registro de progresso");
        
        result = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: courseRealId,
            subjects_data: subjectsData,
            performance_goal: goal,
            exam_date: date ? date.toISOString() : null,
            created_at: currentTime,
            updated_at: currentTime
          });
          
        logWithTimestamp("Resultado da inserção", result);
      }
      
      if (result.error) {
        logWithTimestamp("Erro ao salvar dados no banco", result.error);
        return false;
      }
      
      // Verificar se os dados foram realmente salvos
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_course_progress')
          .select('updated_at')
          .eq('user_id', userId)
          .eq('course_id', courseRealId)
          .maybeSingle();
          
        if (verifyError) {
          logWithTimestamp("Erro ao verificar se os dados foram salvos", verifyError);
        } else if (verifyData) {
          logWithTimestamp("Verificação de salvamento bem sucedida", verifyData);
          setLastSaveTime(verifyData.updated_at);
        }
      } catch (verifyError) {
        logWithTimestamp("Exceção ao verificar salvamento", verifyError);
      }
      
      try {
        localStorage.removeItem(`edital_${courseRealId}`);
        logWithTimestamp("Dados do localStorage removidos após salvar no banco");
      } catch (e) {
        logWithTimestamp("Erro ao remover dados do localStorage", e);
      }
      
      logWithTimestamp("Dados salvos com sucesso no banco de dados");
      setUnsavedChanges(false);
      return true;
    } catch (error) {
      logWithTimestamp("Erro ao salvar dados no banco", error);
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
                  return { ...topic, [field]: value };
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
          // Se mudou o valor de isDone, salvamos automaticamente
          if (field === 'isDone') {
            logWithTimestamp("Campo isDone modificado, salvando automaticamente");
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
