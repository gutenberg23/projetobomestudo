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

  useEffect(() => {
    if (courseId) {
      fetchEditorializedData();
    }
  }, [courseId]);

  const fetchEditorializedData = async () => {
    if (!courseId) return;
    
    setLoading(true);
    console.log("Iniciando carregamento de dados do edital verticalizado");
    
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      console.log("ID do curso:", realId);
      
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('id, titulo, disciplinas_ids')
        .eq('id', realId)
        .maybeSingle();
        
      if (cursoError) {
        console.error('Erro ao buscar curso:', cursoError);
        throw new Error('Erro ao buscar dados do curso');
      }
      
      if (!cursoData) {
        console.log('Curso não encontrado:', realId);
        toast({
          title: "Curso não encontrado",
          description: "O curso solicitado não foi encontrado no sistema.",
          variant: "destructive"
        });
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      console.log("Dados do curso encontrados:", cursoData);
      console.log("IDs das disciplinas no curso:", cursoData.disciplinas_ids);
      
      if (userId !== 'guest') {
        console.log("Usuário logado, buscando dados de progresso");
        const { data: subjectProgressData, error: subjectProgressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', realId)
          .maybeSingle();
        
        if (subjectProgressError) {
          console.error('Erro ao buscar dados de progresso:', subjectProgressError);
        } else {
          console.log("Dados de progresso encontrados:", subjectProgressData);
        }
        
        if (!subjectProgressError && subjectProgressData && subjectProgressData.subjects_data) {
          try {
            const parsedData = JSON.parse(JSON.stringify(subjectProgressData.subjects_data));
            console.log("Dados de disciplinas do banco:", parsedData);
            console.log("É array?", Array.isArray(parsedData));
            console.log("Tamanho:", parsedData.length);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log("Usando dados de disciplinas do banco");
              setSubjects(parsedData as Subject[]);
              setLoading(false);
              return;
            } else {
              console.log("Dados do banco não são um array válido ou estão vazios");
            }
          } catch (e) {
            console.error('Erro ao converter dados JSON:', e);
          }
        } else {
          console.log("Nenhum dado de progresso encontrado no banco ou ocorreu um erro");
        }
      }
      
      const savedData = localStorage.getItem(`${userId}_${realId}_subjectsData`);
      console.log("Verificando dados no localStorage");
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("Dados do localStorage:", parsedData);
          console.log("É array?", Array.isArray(parsedData));
          console.log("Tamanho:", parsedData.length);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log("Usando dados do localStorage");
            setSubjects(parsedData);
            setLoading(false);
            
            if (userId !== 'guest') {
              await saveUserDataToDatabase(realId, parsedData);
            }
            
            return;
          } else {
            console.log("Dados do localStorage não são um array válido ou estão vazios");
          }
        } catch (e) {
          console.error('Erro ao analisar dados salvos:', e);
        }
      } else {
        console.log("Nenhum dado encontrado no localStorage");
      }
      
      const { data: editalData, error: editalError } = await supabase
        .from('cursoverticalizado')
        .select('*')
        .eq('curso_id', cursoData.id.toString())
        .maybeSingle();

      if (editalError) {
        console.error('Erro ao buscar edital:', editalError);
        throw editalError;
      }
      
      console.log("Dados do edital:", editalData);
      
      let disciplinasIds: string[] = [];
      
      if (editalData && editalData.disciplinas_ids && editalData.disciplinas_ids.length > 0) {
        disciplinasIds = editalData.disciplinas_ids;
        console.log("Usando IDs de disciplinas do edital:", disciplinasIds);
      } else if (cursoData.disciplinas_ids && cursoData.disciplinas_ids.length > 0) {
        disciplinasIds = cursoData.disciplinas_ids;
        console.log("Usando IDs de disciplinas do curso:", disciplinasIds);
      }
      
      if (disciplinasIds.length === 0) {
        console.log('Nenhuma disciplina encontrada para o curso:', realId);
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      console.log('Disciplinas IDs para busca:', disciplinasIds);
      console.log('Total de disciplinas a buscar:', disciplinasIds.length);

      let disciplinasData: any[] = [];
      
      const { data: disciplinasVerticalizadasData, error: disciplinasVerticalizadasError } = await supabase
        .from('disciplinaverticalizada')
        .select('*')
        .in('id', disciplinasIds);

      if (disciplinasVerticalizadasError) {
        console.error('Erro ao buscar disciplinas verticalizadas:', disciplinasVerticalizadasError);
      } else {
        console.log("Disciplinas verticalizadas encontradas:", disciplinasVerticalizadasData);
        console.log("Total de disciplinas verticalizadas:", disciplinasVerticalizadasData?.length || 0);
      }

      if (!disciplinasVerticalizadasError && disciplinasVerticalizadasData && disciplinasVerticalizadasData.length > 0) {
        disciplinasData = disciplinasVerticalizadasData;
        console.log("Usando disciplinas verticalizadas");
      } else {
        console.log("Buscando disciplinas normais");
        const { data: disciplinasNormaisData, error: disciplinasNormaisError } = await supabase
          .from('disciplinas')
          .select('*')
          .in('id', disciplinasIds);
          
        if (disciplinasNormaisError) {
          console.error('Erro ao buscar disciplinas:', disciplinasNormaisError);
          throw disciplinasNormaisError;
        } else {
          console.log("Disciplinas normais encontradas:", disciplinasNormaisData);
          console.log("Total de disciplinas normais:", disciplinasNormaisData?.length || 0);
        }
        
        if (disciplinasNormaisData) {
          disciplinasData = disciplinasNormaisData;
          console.log("Usando disciplinas normais");
        }
      }
      
      console.log('Total de disciplinas encontradas:', disciplinasData?.length || 0);
      console.log('Disciplinas encontradas:', disciplinasData);

      const formattedSubjects: Subject[] = (disciplinasData || []).map((disciplina) => {
        const isVerticalizada = 'topicos' in disciplina;
        
        return {
          id: disciplina.id,
          name: disciplina.titulo,
          rating: disciplina.descricao || "",
          topics: isVerticalizada && Array.isArray(disciplina.topicos) 
            ? disciplina.topicos.map((topico: string, topicIndex: number) => {
                const topicKey = `${userId}_${realId}_${disciplina.id}_${topicIndex}`;
                const savedTopicData = localStorage.getItem(topicKey);
                
                if (savedTopicData) {
                  try {
                    return JSON.parse(savedTopicData);
                  } catch (e) {
                    console.error('Erro ao analisar dados do tópico:', e);
                  }
                }
                
                return {
                  id: topicIndex,
                  name: topico,
                  topic: topico,
                  isDone: false,
                  isReviewed: false,
                  importance: (Array.isArray(disciplina.importancia) && disciplina.importancia[topicIndex] 
                    ? disciplina.importancia[topicIndex] 
                    : 0.5) as 1 | 2 | 3 | 4 | 5,
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

      console.log('Disciplinas formatadas:', formattedSubjects);
      console.log('Total de disciplinas formatadas:', formattedSubjects.length);
      
      setSubjects(formattedSubjects);
      
      localStorage.setItem(`${userId}_${realId}_subjectsData`, JSON.stringify(formattedSubjects));
      
      if (userId !== 'guest') {
        await saveUserDataToDatabase(realId, formattedSubjects);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do edital:', error);
      toast({
        title: "Erro ao carregar edital",
        description: "Não foi possível carregar os dados do edital verticalizado.",
        variant: "destructive"
      });
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUserDataToDatabase = async (courseRealId: string, subjectsData: Subject[]) => {
    if (userId === 'guest') return;
    
    try {
      const performanceGoal = localStorage.getItem(`${userId}_${courseRealId}_performanceGoal`);
      const examDate = localStorage.getItem(`${userId}_${courseRealId}_examDate`);
      
      const performanceGoalNumber = performanceGoal ? parseInt(performanceGoal) : 85;
      
      const { data: existingProgress, error: checkProgressError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .maybeSingle();
      
      if (checkProgressError && checkProgressError.code !== 'PGRST116') {
        console.error('Erro ao verificar progresso existente:', checkProgressError);
      } else {
        if (existingProgress) {
          const { error: updateError } = await supabase
            .from('user_course_progress')
            .update({
              subjects_data: subjectsData,
              performance_goal: performanceGoalNumber,
              exam_date: examDate ? new Date(examDate).toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
          
          if (updateError) {
            console.error('Erro ao atualizar progresso no banco:', updateError);
          } else {
            console.log('Progresso atualizado com sucesso no banco de dados');
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_course_progress')
            .insert({
              user_id: userId,
              course_id: courseRealId,
              subjects_data: subjectsData,
              performance_goal: performanceGoalNumber,
              exam_date: examDate ? new Date(examDate).toISOString() : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Erro ao inserir progresso no banco:', insertError);
          } else {
            console.log('Novo progresso inserido com sucesso no banco de dados');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados no banco:', error);
    }
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
                  const updatedTopic = { ...topic, [field]: value };
                  
                  if (courseId) {
                    const realId = extractIdFromFriendlyUrl(courseId);
                    const topicKey = `${userId}_${realId}_${subjectId}_${topicId}`;
                    localStorage.setItem(topicKey, JSON.stringify(updatedTopic));
                  }
                  
                  return updatedTopic;
                }
                return topic;
              })
            };
          }
          return subject;
        });
        
        if (courseId) {
          const realId = extractIdFromFriendlyUrl(courseId);
          localStorage.setItem(`${userId}_${realId}_subjectsData`, JSON.stringify(updatedSubjects));
          
          if (userId !== 'guest') {
            saveUserDataToDatabase(realId, updatedSubjects);
          }
        }
        
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

  return {
    subjects,
    loading,
    updateTopicProgress
  };
};
