
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
  const [saveAttempts, setSaveAttempts] = useState(0);

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

  // Verificar status da sessão periodicamente e recarregar dados se necessário
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
          
          // Se a sessão estiver válida e não tivermos dados carregados, tentar carregar novamente
          if (subjects.length === 0 && !loading) {
            logWithTimestamp('Tentando recarregar dados devido à sessão válida mas dados vazios');
            setRefreshTrigger(prev => prev + 1);
          }
        } else {
          logWithTimestamp('Nenhuma sessão ativa encontrada');
          
          // Tentar renovar a sessão
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              logWithTimestamp('Erro ao renovar sessão', refreshError);
            } else if (refreshData.session) {
              logWithTimestamp('Sessão renovada com sucesso');
              if (subjects.length === 0 && !loading) {
                logWithTimestamp('Tentando recarregar dados após renovação da sessão');
                setRefreshTrigger(prev => prev + 1);
              }
            }
          } catch (refreshError) {
            logWithTimestamp('Exceção ao renovar sessão', refreshError);
          }
        }
      } catch (error) {
        logWithTimestamp('Exceção ao verificar sessão', error);
      }
    };

    // Verificar imediatamente e depois a cada 3 minutos
    checkSession();
    const interval = setInterval(checkSession, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, subjects.length, loading, logWithTimestamp]);

  // Auto-salvar mudanças mais frequentemente se houver alterações não salvas
  useEffect(() => {
    if (userId === 'guest' || !unsavedChanges || !courseId) return;

    const autoSaveTimeout = setTimeout(() => {
      logWithTimestamp('Iniciando auto-save de alterações não salvas');
      saveAllDataToDatabase();
    }, 30000); // Auto-save a cada 30 segundos se houver mudanças

    return () => clearTimeout(autoSaveTimeout);
  }, [unsavedChanges, userId, courseId]);

  const fetchEditorializedData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const realId = extractIdFromFriendlyUrl(courseId);
      logWithTimestamp('ID do curso extraído', realId);
      
      try {
        // Verificar estado de cache no localStorage para evitar dados fantasmas
        const cacheTimestampKey = `edital_${realId}_timestamp`;
        const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
        const currentTime = new Date().getTime();
        const cacheMaxAge = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        
        // Se o cache for muito antigo, limpe-o
        if (cachedTimestamp && (currentTime - parseInt(cachedTimestamp)) > cacheMaxAge) {
          logWithTimestamp('Cache antigo detectado, limpando');
          localStorage.removeItem(`edital_${realId}`);
          localStorage.removeItem(cacheTimestampKey);
        }
        
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
              // Buscar múltiplos registros e ordenar por data de criação/atualização
              const { data: progressData, error: progressError } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', currentUserId)
                .eq('course_id', realId)
                .order('updated_at', { ascending: false })
                .limit(5); // Buscar os 5 registros mais recentes para análise
              
              if (progressError) {
                logWithTimestamp('Erro ao buscar dados de progresso', progressError);
              } else if (progressData && progressData.length > 0) {
                // Usar o registro mais recente
                const latestProgress = progressData[0];
                logWithTimestamp('Múltiplos registros de progresso encontrados', {
                  count: progressData.length,
                  latestUpdated: latestProgress.updated_at
                });
                
                try {
                  // Obtenha a data e hora da última atualização
                  const lastUpdated = latestProgress.updated_at;
                  logWithTimestamp('Última atualização dos dados no servidor', lastUpdated);
                  setLastSaveTime(lastUpdated);
                  
                  if (latestProgress.subjects_data) {
                    // Garantir que os dados são válidos antes de tentar mesclar
                    try {
                      // Converter para string JSON e de volta para evitar referências
                      const savedProgress = JSON.parse(JSON.stringify(latestProgress.subjects_data));
                      
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
                        if (latestProgress.performance_goal) {
                          const goalValue = parseInt(latestProgress.performance_goal.toString());
                          logWithTimestamp('Meta de aproveitamento carregada', goalValue);
                          setPerformanceGoal(goalValue);
                        }
                        
                        if (latestProgress.exam_date) {
                          const examDateValue = new Date(latestProgress.exam_date);
                          logWithTimestamp('Data da prova carregada', examDateValue);
                          setExamDate(examDateValue);
                        }
                        
                        // Atualizar cache local com marcação de tempo para validação futura
                        try {
                          localStorage.setItem(`edital_${realId}`, JSON.stringify(mergedSubjects));
                          localStorage.setItem(cacheTimestampKey, currentTime.toString());
                          logWithTimestamp('Cache local atualizado com dados mesclados e timestamp');
                        } catch (cacheError) {
                          logWithTimestamp('Erro ao atualizar cache local', cacheError);
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
                    logWithTimestamp('Nenhum dado de subjects_data encontrado no registro de progresso');
                  }
                } catch (e) {
                  logWithTimestamp('Erro ao processar dados de progresso', e);
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
              localStorage.setItem(cacheTimestampKey, currentTime.toString());
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
      date: date?.toISOString(),
      saveAttempt: saveAttempts + 1
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
      
      // Verificar novamente a sessão após tentativa de renovação
      const { data: verifiedSession } = await supabase.auth.getSession();
      
      if (!verifiedSession?.session) {
        logWithTimestamp("Sessão inválida após verificação/renovação");
        toast({
          title: "Erro de sessão",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive"
        });
        return false;
      }
      
      // Verificar registros existentes
      const { data: existingData, error: existingError } = await supabase
        .from('user_course_progress')
        .select('id, updated_at')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (existingError && existingError.code !== 'PGRST116') {
        logWithTimestamp("Erro ao verificar dados existentes", existingError);
        return false;
      }
      
      const currentTime = new Date().toISOString();
      let result;
      
      // Validar dados antes de salvar
      if (!Array.isArray(subjectsData) || subjectsData.length === 0) {
        logWithTimestamp("Dados de subjects inválidos para salvar", subjectsData);
        return false;
      }
      
      // Garantir que os subjects tenham um formato consistente antes de salvar
      const validatedSubjectsData = subjectsData.map(subject => ({
        ...subject,
        topics: Array.isArray(subject.topics) ? subject.topics : []
      }));
      
      if (existingData && existingData.length > 0) {
        const existingRecord = existingData[0];
        logWithTimestamp("Atualizando registro existente", {
          recordId: existingRecord.id,
          lastUpdate: existingRecord.updated_at
        });
        
        result = await supabase
          .from('user_course_progress')
          .update({
            subjects_data: validatedSubjectsData,
            performance_goal: goal,
            exam_date: date ? date.toISOString() : null,
            updated_at: currentTime
          })
          .eq('id', existingRecord.id);
          
        logWithTimestamp("Resultado da atualização", result);
      } else {
        logWithTimestamp("Criando novo registro de progresso");
        
        result = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: courseRealId,
            subjects_data: validatedSubjectsData,
            performance_goal: goal,
            exam_date: date ? date.toISOString() : null,
            created_at: currentTime,
            updated_at: currentTime
          });
          
        logWithTimestamp("Resultado da inserção", result);
      }
      
      if (result.error) {
        logWithTimestamp("Erro ao salvar dados no banco", result.error);
        
        // Incrementar contador de tentativas para análise de problemas
        setSaveAttempts(prev => prev + 1);
        
        // Tentar novamente com um approach diferente se o erro for de violação de integridade
        if (result.error.code === '23505' && existingData && existingData.length > 0) {
          logWithTimestamp("Tentando abordagem alternativa para atualização devido a erro de integridade");
          
          const altResult = await supabase
            .from('user_course_progress')
            .upsert({
              id: existingData[0].id,
              user_id: userId,
              course_id: courseRealId,
              subjects_data: validatedSubjectsData,
              performance_goal: goal,
              exam_date: date ? date.toISOString() : null,
              updated_at: currentTime
            });
            
          if (altResult.error) {
            logWithTimestamp("Erro também na abordagem alternativa", altResult.error);
            return false;
          } else {
            logWithTimestamp("Abordagem alternativa bem sucedida");
          }
        } else {
          return false;
        }
      }
      
      // Verificar se os dados foram realmente salvos
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_course_progress')
          .select('updated_at')
          .eq('user_id', userId)
          .eq('course_id', courseRealId)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (verifyError) {
          logWithTimestamp("Erro ao verificar se os dados foram salvos", verifyError);
        } else if (verifyData && verifyData.length > 0) {
          logWithTimestamp("Verificação de salvamento bem sucedida", verifyData[0]);
          setLastSaveTime(verifyData[0].updated_at);
          
          // Atualizar cache local
          try {
            localStorage.setItem(`edital_${courseRealId}`, JSON.stringify(validatedSubjectsData));
            localStorage.setItem(`edital_${courseRealId}_timestamp`, new Date().getTime().toString());
            logWithTimestamp("Cache local atualizado após salvamento bem-sucedido");
          } catch (e) {
            logWithTimestamp("Erro ao atualizar cache local após salvamento", e);
          }
        } else {
          logWithTimestamp("Verificação não encontrou dados salvos");
        }
      } catch (verifyError) {
        logWithTimestamp("Exceção ao verificar salvamento", verifyError);
      }
      
      logWithTimestamp("Dados salvos com sucesso no banco de dados");
      setUnsavedChanges(false);
      // Resetar contador de tentativas após sucesso
      setSaveAttempts(0);
      return true;
    } catch (error) {
      logWithTimestamp("Erro ao salvar dados no banco", error);
      // Incrementar contador de tentativas
      setSaveAttempts(prev => prev + 1);
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
        localStorage.removeItem(`edital_${realId}_timestamp`);
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
            localStorage.setItem(`edital_${realId}_timestamp`, new Date().getTime().toString());
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
                
                // Enviar evento personalizado para notificar outros componentes sobre a mudança
                const event = new CustomEvent('topicCompleted', { 
                  detail: { 
                    subjectId, 
                    topicId, 
                    value,
                    timestamp: new Date().toISOString() 
                  } 
                });
                document.dispatchEvent(event);
              }
            }, 300);
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
        
        // Disparar evento para atualizar outros componentes
        const event = new CustomEvent('dataSaved', { 
          detail: { 
            timestamp: now,
            success: true
          } 
        });
        document.dispatchEvent(event);
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
              
              // Disparar evento para atualizar outros componentes
              const event = new CustomEvent('dataSaved', { 
                detail: { 
                  timestamp: new Date().toISOString(),
                  success: true,
                  wasRetry: true
                } 
              });
              document.dispatchEvent(event);
              
              return true;
            } else {
              logWithTimestamp("Segunda tentativa de salvamento falhou");
              
              // Disparar evento de falha
              const event = new CustomEvent('dataSaved', { 
                detail: { 
                  timestamp: new Date().toISOString(),
                  success: false
                } 
              });
              document.dispatchEvent(event);
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
