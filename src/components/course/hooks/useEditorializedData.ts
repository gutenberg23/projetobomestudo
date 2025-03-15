
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
    
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      
      // Primeiro, verificar se existem dados do usuário no banco de dados
      if (userId !== 'guest') {
        const { data: userData, error: userDataError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', realId)
          .single();
        
        if (!userDataError && userData && userData.subjects_data) {
          try {
            const parsedData = JSON.parse(userData.subjects_data.toString());
            setSubjects(parsedData);
            setLoading(false);
            
            // Também salvar no localStorage como backup
            localStorage.setItem(`${userId}_${realId}_subjectsData`, userData.subjects_data.toString());
            
            // Carregar dados da meta de aproveitamento e data da prova
            if (userData.performance_goal) {
              localStorage.setItem(`${userId}_${realId}_performanceGoal`, userData.performance_goal.toString());
            }
            
            if (userData.exam_date) {
              localStorage.setItem(`${userId}_${realId}_examDate`, userData.exam_date.toString());
            }
            
            return;
          } catch (e) {
            console.error('Erro ao analisar dados do banco:', e);
            // Continuar com a busca no localStorage ou banco
          }
        }
      }
      
      // Se não encontrou no banco ou deu erro, verificar no localStorage
      const savedData = localStorage.getItem(`${userId}_${realId}_subjectsData`);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setSubjects(parsedData);
          setLoading(false);
          
          // Se temos dados no localStorage mas não no banco, e o usuário está logado, salvar no banco
          if (userId !== 'guest') {
            await saveUserDataToDatabase(realId, parsedData);
          }
          
          return;
        } catch (e) {
          console.error('Erro ao analisar dados salvos:', e);
          // Continuar com a busca no banco de dados
        }
      }
      
      // Verificar se já temos dados salvos no localStorage para este curso e usuário
      const savedData2 = localStorage.getItem(`${userId}_${realId}_subjectsData`);
      
      if (savedData2) {
        try {
          const parsedData = JSON.parse(savedData2);
          setSubjects(parsedData);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Erro ao analisar dados salvos:', e);
          // Continuar com a busca no banco de dados
        }
      }
      
      // Primeiro, buscamos o curso para verificar se ele existe
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('id, titulo')
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
        return;
      }
      
      // Agora buscamos o edital verticalizado
      const { data: editalData, error: editalError } = await supabase
        .from('cursoverticalizado')
        .select('*')
        .eq('curso_id', cursoData.id.toString())
        .maybeSingle();

      if (editalError) {
        console.error('Erro ao buscar edital:', editalError);
        throw editalError;
      }
      
      if (!editalData) {
        console.log('Nenhum edital encontrado para o curso:', realId);
        setSubjects([]);
        return;
      }
      
      console.log('Dados do edital encontrados:', editalData);
      console.log('Disciplinas IDs:', editalData.disciplinas_ids);

      // Buscar as disciplinas associadas ao edital
      const { data: disciplinasData, error: disciplinasError } = await supabase
        .from('disciplinaverticalizada')
        .select('*')
        .in('id', editalData.disciplinas_ids || []);

      if (disciplinasError) {
        console.error('Erro ao buscar disciplinas:', disciplinasError);
        throw disciplinasError;
      }
      
      console.log('Disciplinas encontradas:', disciplinasData);

      const formattedSubjects: Subject[] = (disciplinasData || []).map((disciplina) => ({
        id: disciplina.id,
        name: disciplina.titulo,
        topics: Array.isArray(disciplina.topicos) ? disciplina.topicos.map((topico: string, topicIndex: number) => {
          // Verificar se há dados salvos para este tópico específico
          const topicKey = `${userId}_${realId}_${disciplina.id}_${topicIndex}`;
          const savedTopicData = localStorage.getItem(topicKey);
          
          if (savedTopicData) {
            try {
              return JSON.parse(savedTopicData);
            } catch (e) {
              console.error('Erro ao analisar dados do tópico:', e);
            }
          }
          
          // Retornar dados padrão se não houver dados salvos
          return {
            id: topicIndex,
            name: topico,
            topic: topico,
            isDone: false,
            isReviewed: false,
            importance: (Array.isArray(disciplina.importancia) && disciplina.importancia[topicIndex] 
              ? disciplina.importancia[topicIndex] 
              : 0.5) as 1 | 2 | 3 | 4 | 5,
            difficulty: "Médio",
            exercisesDone: 0,
            hits: 0,
            errors: 0,
            performance: 0
          };
        }) : []
      }));

      setSubjects(formattedSubjects);
      
      // Salvar os dados formatados no localStorage
      localStorage.setItem(`${userId}_${realId}_subjectsData`, JSON.stringify(formattedSubjects));
      
      // Se o usuário estiver logado, salvar também no banco de dados
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

  // Função para salvar os dados do usuário no banco de dados
  const saveUserDataToDatabase = async (courseRealId: string, subjectsData: Subject[]) => {
    if (userId === 'guest') return;
    
    try {
      // Obter a meta de aproveitamento e a data da prova do localStorage
      const performanceGoalStr = localStorage.getItem(`${userId}_${courseRealId}_performanceGoal`);
      const examDate = localStorage.getItem(`${userId}_${courseRealId}_examDate`);
      
      // Converter a meta de aproveitamento para número
      const performanceGoal = performanceGoalStr ? parseInt(performanceGoalStr) : 85;
      
      // Verificar se o registro já existe
      const { data: existingData, error: checkError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao verificar dados existentes:', checkError);
        return;
      }
      
      const subjectsDataString = JSON.stringify(subjectsData);
      
      if (existingData) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('user_course_progress')
          .update({
            subjects_data: subjectsDataString,
            performance_goal: performanceGoal,
            exam_date: examDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        
        if (updateError) {
          console.error('Erro ao atualizar dados no banco:', updateError);
        }
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: userId,
            course_id: courseRealId,
            subjects_data: subjectsDataString,
            performance_goal: performanceGoal,
            exam_date: examDate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Erro ao inserir dados no banco:', insertError);
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
                  
                  // Salvar o tópico atualizado no localStorage
                  if (courseId) {
                    const realId = extractIdFromFriendlyUrl(courseId);
                    const topicKey = `${userId}_${subjectId}_${topicId}`;
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
        
        // Salvar todos os dados atualizados no localStorage
        if (courseId) {
          const realId = extractIdFromFriendlyUrl(courseId);
          localStorage.setItem(`${userId}_${realId}_subjectsData`, JSON.stringify(updatedSubjects));
          
          // Se o usuário estiver logado, salvar também no banco de dados
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
