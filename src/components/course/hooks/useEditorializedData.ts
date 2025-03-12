
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Subject, Topic } from '../types/editorialized';

export const useEditorializedData = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEditorializedData = async () => {
    try {
      setLoading(true);
      
      const { data: editalData, error: editalError } = await supabase
        .from('cursoverticalizado')
        .select('*')
        .eq('curso_id', courseId)
        .single();

      if (editalError) throw editalError;
      
      if (!editalData) {
        setSubjects([]);
        return;
      }

      const { data: disciplinasData, error: disciplinasError } = await supabase
        .from('disciplinaverticalizada')
        .select('*')
        .in('id', editalData.disciplinas_ids || []);

      if (disciplinasError) throw disciplinasError;

      const formattedSubjects: Subject[] = (disciplinasData || []).map((disciplina) => ({
        id: disciplina.id,
        name: disciplina.titulo,
        topics: disciplina.topicos.map((topico, topicIndex) => ({
          id: topicIndex,
          name: topico,
          topic: topico,
          isDone: false,
          isReviewed: false,
          importance: (disciplina.importancia[topicIndex] || 1) as 1 | 2 | 3 | 4 | 5,
          difficulty: "Médio",
          exercisesDone: 0,
          hits: 0,
          errors: 0,
          performance: 0
        }))
      }));

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error('Erro ao carregar dados do edital:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do edital verticalizado.",
        variant: "destructive"
      });
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
