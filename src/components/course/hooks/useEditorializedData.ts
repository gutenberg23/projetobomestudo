
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
      
      // Verificar se usuário está logado
      if (userId !== 'guest') {
        // Buscar dados do progresso por disciplina através da tabela user_course_progress
        // Estamos usando user_course_progress até que o tipo do Supabase seja atualizado
        const { data: subjectProgressData, error: subjectProgressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', realId)
          .eq('subjects_data', true) // Filtrar apenas registros que contêm dados de disciplinas
          .maybeSingle();
        
        if (!subjectProgressError && subjectProgressData && subjectProgressData.subjects_data) {
          try {
            // Tentar converter os dados do JSON para o formato Subject[]
            const parsedData = JSON.parse(JSON.stringify(subjectProgressData.subjects_data));
            if (Array.isArray(parsedData)) {
              setSubjects(parsedData as Subject[]);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Erro ao converter dados JSON:', e);
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
        }
      }
      
      // Se não encontrou dados no localStorage nem no banco, buscar dados do edital verticalizado
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
        rating: disciplina.descricao, // Adicionando o valor de rating (antigo campo descrição)
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
      const performanceGoal = localStorage.getItem(`${userId}_${courseRealId}_performanceGoal`);
      const examDate = localStorage.getItem(`${userId}_${courseRealId}_examDate`);
      
      // Salvar metas e data do exame junto com os dados das disciplinas na tabela user_course_progress
      // Estamos usando user_course_progress até que o tipo do Supabase seja atualizado
      const performanceGoalNumber = performanceGoal ? parseInt(performanceGoal) : 85; // Valor padrão de 85%
      
      // Verificar se já existe um registro para este usuário e curso
      const { data: existingProgress, error: checkProgressError } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .maybeSingle();
      
      if (checkProgressError && checkProgressError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao verificar progresso existente:', checkProgressError);
      } else {
        // Atualizar ou inserir dados de progresso completos
        if (existingProgress) {
          // Atualizar registro existente
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
          }
        } else {
          // Criar novo registro
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
                  
                  // Salvar o tópico atualizado no localStorage
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
