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

  const fetchEditorializedData = async () => {
    if (!courseId) return;
    
    setLoading(true);
    
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      
      // Verificar se já temos dados salvos no localStorage para este curso e usuário
      const savedData = localStorage.getItem(`${userId}_${realId}_subjectsData`);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
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
        }
        
        return updatedSubjects;
      });
      
      // Aqui você pode implementar a lógica para salvar no banco
      // por exemplo, criar uma nova tabela para progresso do aluno
      
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchEditorializedData();
    }
  }, [courseId]);

  return {
    subjects,
    loading,
    updateTopicProgress
  };
};
