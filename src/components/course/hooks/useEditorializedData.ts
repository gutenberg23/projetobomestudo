
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!courseId) return;
    
    const loadData = async () => {
      console.log(`Carregando dados do edital. Trigger: ${refreshTrigger}`);
      await fetchEditorializedData();
    };
    
    loadData();
  }, [courseId, userId, refreshTrigger]);

  const fetchEditorializedData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const realId = extractIdFromFriendlyUrl(courseId);
      
      try {
        let sessionValid = false;
        let currentUserId = 'guest';
        
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.log("Erro ao verificar sessão:", sessionError);
            sessionValid = false;
          } else if (sessionData.session) {
            sessionValid = true;
            currentUserId = sessionData.session.user.id;
          } else {
            console.log("Nenhuma sessão ativa encontrada");
            sessionValid = false;
          }
        } catch (sessionCheckError) {
          console.error("Erro ao obter sessão:", sessionCheckError);
          sessionValid = false;
        }
        
        console.log("Usuário atual:", currentUserId);
        
        console.log('Buscando dados do edital verticalizado diretamente da fonte');
        
        try {
          const { data: editalData, error: editalError } = await supabase
            .from('cursoverticalizado')
            .select('*')
            .eq('curso_id', realId)
            .maybeSingle();

          if (editalError) {
            console.error('Erro ao buscar dados do edital:', editalError);
            throw editalError;
          }
          
          if (!editalData) {
            console.log('Nenhum edital verticalizado encontrado para este curso');
            setSubjects([]);
            setLoading(false);
            return;
          }
          
          console.log('Dados do edital encontrados:', editalData);
          
          let disciplinasData: any[] = [];
          
          if (editalData.disciplinas_ids && Array.isArray(editalData.disciplinas_ids)) {
            const { data: disciplinas, error: disciplinasError } = await supabase
              .from('disciplinaverticalizada')
              .select('*')
              .in('id', editalData.disciplinas_ids);
              
            if (disciplinasError) {
              console.error('Erro ao buscar disciplinas:', disciplinasError);
              throw disciplinasError;
            }
            
            if (disciplinas && disciplinas.length > 0) {
              disciplinasData = disciplinas;
              console.log('Disciplinas encontradas:', disciplinas.length);
            } else {
              console.log('Nenhuma disciplina encontrada para o edital');
            }
          }
          
          const formattedSubjects = formatSubjectsFromEdital(disciplinasData);
          console.log('Total de disciplinas formatadas:', formattedSubjects.length);
          
          if (currentUserId !== 'guest' && sessionValid) {
            try {
              const { data: progressData, error: progressError } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', currentUserId)
                .eq('course_id', realId)
                .maybeSingle();
              
              if (progressError) {
                console.error('Erro ao buscar dados de progresso:', progressError);
              } else if (progressData && progressData.subjects_data) {
                try {
                  const savedProgress = JSON.parse(JSON.stringify(progressData.subjects_data));
                  
                  if (Array.isArray(savedProgress) && savedProgress.length > 0) {
                    console.log('Mesclando dados de progresso com dados do edital');
                    
                    const mergedSubjects = formattedSubjects.map(subject => {
                      const savedSubject = savedProgress.find((s: any) => s.id === subject.id);
                      if (savedSubject) {
                        const mergedTopics = subject.topics.map(topic => {
                          const savedTopic = savedSubject.topics.find((t: any) => t.id === topic.id);
                          return savedTopic ? { ...topic, ...savedTopic } : topic;
                        });
                        
                        return { ...subject, ...savedSubject, topics: mergedTopics };
                      }
                      return subject;
                    });
                    
                    console.log('Dados mesclados com sucesso');
                    setSubjects(mergedSubjects);
                    setUnsavedChanges(false);
                    setLoading(false);
                    return;
                  }
                } catch (e) {
                  console.error('Erro ao mesclar dados de progresso:', e);
                }
              }
            } catch (e) {
              console.error('Erro ao buscar dados de progresso:', e);
            }
          }
          
          setSubjects(formattedSubjects);
          setUnsavedChanges(false);
          
          if (currentUserId === 'guest') {
            try {
              localStorage.setItem(`edital_${realId}`, JSON.stringify(formattedSubjects));
              console.log('Dados salvos no localStorage para usuário não logado');
            } catch (localStorageError) {
              console.error('Erro ao salvar no localStorage:', localStorageError);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados do edital:', error);
          
          if (currentUserId === 'guest') {
            try {
              const savedData = localStorage.getItem(`edital_${realId}`);
              if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Dados carregados do localStorage para usuário não logado após erro:', parsedData);
                setSubjects(parsedData);
              } else {
                console.log('Nenhum dado encontrado no localStorage');
                setSubjects([]);
              }
            } catch (localStorageError) {
              console.error('Erro ao carregar dados do localStorage:', localStorageError);
              setSubjects([]);
            }
          } else {
            setSubjects([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do edital:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do edital. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setLoading(false);
        setSubjects([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do edital:', error);
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
      console.error('Dados de disciplinas não são um array:', disciplinas);
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

  const saveUserDataToDatabase = async (courseRealId: string, subjectsData: Subject[]): Promise<boolean> => {
    if (userId === 'guest') return false;
    
    console.log("Tentando salvar dados no banco de dados");
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao verificar sessão:", sessionError);
        return false;
      }
      
      if (!sessionData.session) {
        console.log("Sessão inválida, não é possível salvar dados no banco");
        return false;
      }
      
      const { data: existingData, error: existingError } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .maybeSingle();
      
      if (existingError && existingError.code !== 'PGRST116') {
        console.error("Erro ao verificar dados existentes:", existingError);
        return false;
      }
      
      let result;
      
      if (existingData) {
        result = await supabase
          .from('user_course_progress')
          .update({
            subjects_data: subjectsData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('course_id', courseRealId);
          
        console.log("Dados atualizados no banco de dados");
      } else {
        result = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: courseRealId,
            subjects_data: subjectsData,
            performance_goal: 85,
            exam_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        console.log("Novos dados salvos no banco de dados");
      }
      
      if (result.error) {
        console.error("Erro ao salvar dados no banco:", result.error);
        return false;
      }
      
      try {
        localStorage.removeItem(`edital_${courseRealId}`);
        console.log("Dados do localStorage removidos após salvar no banco");
      } catch (e) {
        console.error("Erro ao remover dados do localStorage:", e);
      }
      
      console.log("Dados salvos com sucesso no banco de dados");
      setUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error("Erro ao salvar dados no banco:", error);
      return false;
    }
  };

  const forceRefresh = async () => {
    console.log("Forçando recarregamento dos dados do edital verticalizado");
    
    setSubjects([]);
    
    if (courseId) {
      const realId = extractIdFromFriendlyUrl(courseId);
      try {
        localStorage.removeItem(`edital_${realId}`);
        console.log(`Cache do localStorage para edital_${realId} removido durante forceRefresh`);
      } catch (e) {
        console.error("Erro ao remover dados do localStorage:", e);
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
          } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
          }
        }
        
        setUnsavedChanges(true);
        console.log("Mudanças detectadas, setUnsavedChanges(true)");
        
        return updatedSubjects;
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    }
  };

  const saveAllDataToDatabase = async () => {
    if (userId === 'guest' || !courseId) return false;
    
    try {
      setLoading(true);
      const realId = extractIdFromFriendlyUrl(courseId);
      const result = await saveUserDataToDatabase(realId, subjects);
      setLoading(false);
      
      if (result) {
        setUnsavedChanges(false);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar todos os dados:', error);
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
    setUnsavedChanges
  };
};
