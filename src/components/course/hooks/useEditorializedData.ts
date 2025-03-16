
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
        // Buscar dados do progresso por disciplina
        const { data: subjectProgressData, error: subjectProgressError } = await supabase
          .from('user_subject_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', realId);
        
        if (!subjectProgressError && subjectProgressData && subjectProgressData.length > 0) {
          // Transformar os dados do banco em formato de Subject[]
          const formattedSubjects: Subject[] = subjectProgressData.map(progressData => {
            const topics: Topic[] = [];
            
            // Mapear os arrays paralelos para objetos de tópico
            for (let i = 0; i < progressData.line_numbers.length; i++) {
              topics.push({
                id: progressData.line_numbers[i],
                name: progressData.topics[i] || '',
                topic: progressData.topics[i] || '',
                isDone: progressData.completed[i] || false,
                isReviewed: progressData.reviewed[i] || false,
                importance: progressData.importance[i] || 3,
                difficulty: progressData.difficulty[i] || "Médio",
                exercisesDone: progressData.total_exercises[i] || 0,
                hits: progressData.correct_answers[i] || 0,
                errors: 0, // Calculado no frontend
                performance: 0 // Calculado no frontend
              });
            }
            
            return {
              id: progressData.subject_name,
              name: progressData.subject_name,
              topics
            };
          });
          
          setSubjects(formattedSubjects);
          setLoading(false);
          return;
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
      
      // Salvar metas e data do exame
      const performanceGoalNumber = performanceGoal ? parseInt(performanceGoal) : undefined;
      
      // Verificar se já existe um registro para este usuário e curso
      const { data: existingGoal, error: checkGoalError } = await supabase
        .from('user_exam_goals')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .maybeSingle();
      
      if (checkGoalError && checkGoalError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao verificar metas existentes:', checkGoalError);
      } else {
        // Atualizar ou inserir metas de exame
        if (existingGoal) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('user_exam_goals')
            .update({
              performance_goal: performanceGoalNumber,
              exam_date: examDate ? new Date(examDate).toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingGoal.id);
          
          if (updateError) {
            console.error('Erro ao atualizar metas no banco:', updateError);
          }
        } else {
          // Criar novo registro
          const { error: insertError } = await supabase
            .from('user_exam_goals')
            .insert({
              user_id: userId,
              course_id: courseRealId,
              performance_goal: performanceGoalNumber,
              exam_date: examDate ? new Date(examDate).toISOString() : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Erro ao inserir metas no banco:', insertError);
          }
        }
      }
      
      // Preparar e salvar dados de progresso por disciplina
      for (const subject of subjectsData) {
        // Verificar se já existe registro para esta disciplina
        const { data: existingProgress, error: checkProgressError } = await supabase
          .from('user_subject_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseRealId)
          .eq('subject_name', subject.name)
          .maybeSingle();
        
        // Preparar arrays para o banco de dados
        const lineNumbers: number[] = [];
        const completed: boolean[] = [];
        const topics: string[] = [];
        const importance: number[] = [];
        const difficulty: string[] = [];
        const totalExercises: number[] = [];
        const correctAnswers: number[] = [];
        const reviewed: boolean[] = [];
        
        // Preencher os arrays com dados dos tópicos
        subject.topics.forEach(topic => {
          lineNumbers.push(topic.id);
          completed.push(topic.isDone);
          topics.push(topic.topic);
          importance.push(topic.importance);
          difficulty.push(topic.difficulty);
          totalExercises.push(topic.exercisesDone);
          correctAnswers.push(topic.hits);
          reviewed.push(topic.isReviewed);
        });
        
        if (checkProgressError && checkProgressError.code !== 'PGRST116') {
          console.error('Erro ao verificar progresso existente:', checkProgressError);
        } else {
          // Atualizar ou inserir dados de progresso
          if (existingProgress) {
            // Atualizar registro existente
            const { error: updateError } = await supabase
              .from('user_subject_progress')
              .update({
                line_numbers: lineNumbers,
                completed: completed,
                topics: topics,
                importance: importance,
                difficulty: difficulty,
                total_exercises: totalExercises,
                correct_answers: correctAnswers,
                reviewed: reviewed,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProgress.id);
            
            if (updateError) {
              console.error('Erro ao atualizar progresso no banco:', updateError);
            }
          } else {
            // Criar novo registro
            const { error: insertError } = await supabase
              .from('user_subject_progress')
              .insert({
                user_id: userId,
                course_id: courseRealId,
                subject_name: subject.name,
                line_numbers: lineNumbers,
                completed: completed,
                topics: topics,
                importance: importance,
                difficulty: difficulty,
                total_exercises: totalExercises,
                correct_answers: correctAnswers,
                reviewed: reviewed,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error('Erro ao inserir progresso no banco:', insertError);
            }
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
