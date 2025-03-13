
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Subject, Topic } from '../types/editorialized';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';

export const useEditorializedData = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEditorializedData = async () => {
    try {
      setLoading(true);
      
      if (!courseId) {
        setSubjects([]);
        return;
      }

      // Extrair o ID real da URL amigável
      const realId = extractIdFromFriendlyUrl(courseId);
      console.log("ID real para edital:", realId);
      
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
        .eq('curso_id', realId)
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
        topics: Array.isArray(disciplina.topicos) ? disciplina.topicos.map((topico: string, topicIndex: number) => ({
          id: topicIndex,
          name: topico,
          topic: topico,
          isDone: false,
          isReviewed: false,
          importance: (Array.isArray(disciplina.importancia) && disciplina.importancia[topicIndex] 
            ? disciplina.importancia[topicIndex] 
            : 1) as 1 | 2 | 3 | 4 | 5,
          difficulty: "Médio",
          exercisesDone: 0,
          hits: 0,
          errors: 0,
          performance: 0
        })) : []
      }));

      setSubjects(formattedSubjects);
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
      setSubjects(prevSubjects =>
        prevSubjects.map(subject => {
          if (subject.id === subjectId) {
            return {
              ...subject,
              topics: subject.topics.map(topic =>
                topic.id === topicId
                  ? { ...topic, [field]: value }
                  : topic
              )
            };
          }
          return subject;
        })
      );
      
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
