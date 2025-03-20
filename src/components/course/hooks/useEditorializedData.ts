
import { useState, useEffect } from 'react';
import { Subject, StudyConfig, StudyFilter, AnyObject, Topic } from '../types/editorialized';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Hook para gerenciar dados e configurações de estudo editorializados
export const useEditorializedData = (courseId?: string) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyConfig, setStudyConfig] = useState<StudyConfig | null>(null);
  const [studyFilter, setStudyFilter] = useState<StudyFilter>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados do Supabase ao montar o componente
  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId, user]);

  // Função para carregar dados do Supabase
  const loadData = async () => {
    if (!user || !courseId) {
      setLoading(false);
      return;
    }

    try {
      // Carrega progresso do usuário
      const progress = await loadProgressFromSupabase(courseId);
      if (progress && progress.subjects_data) {
        // Converter o JSON para o tipo Subject[]
        const subjectsFromJson = progress.subjects_data as unknown as Subject[];
        setSubjects(subjectsFromJson);
      } else {
        // Se não houver progresso, inicializa com dados padrão
        setSubjects(await initializeDefaultSubjects());
      }

      // Carrega configuração de estudo
      const config = await loadConfigFromSupabase(courseId);
      setStudyConfig(config);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para forçar um recarregamento dos dados
  const forceRefresh = () => {
    setLoading(true);
    loadData();
  };

  // Função para inicializar dados padrão dos subjects
  const initializeDefaultSubjects = async (): Promise<Subject[]> => {
    // Aqui você pode definir a lógica para carregar os subjects padrão
    // Por exemplo, você pode buscar de um arquivo JSON local ou de uma API
    return []; // Retorna um array vazio por padrão
  };

  // Função para carregar progresso do Supabase
  const loadProgressFromSupabase = async (courseId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error) {
        console.error('Erro ao carregar progresso:', error);
        return null;
      }

      return data;
    } catch (e) {
      console.error('Erro ao carregar progresso:', e);
      return null;
    }
  };

  // Função para carregar configuração do Supabase
  const loadConfigFromSupabase = async (courseId: string): Promise<StudyConfig | null> => {
    if (!user) return null;

    // Simula a configuração de estudo
    return {
      userId: user.id,
      courseId: courseId,
      performanceGoal: 70,
      examDate: new Date()
    };
  };

  // Função para atualizar o status de um tópico
  const updateTopicStatus = (subjectId: string | number, topicId: number, isDone: boolean) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              topics: subject.topics.map(topic =>
                topic.id === topicId ? { ...topic, isDone: isDone } : topic
              )
            }
          : subject
      )
    );
  };

  // Função mais genérica para atualizar qualquer campo de um tópico
  const updateTopicProgress = (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              topics: subject.topics.map(topic =>
                topic.id === topicId ? { ...topic, [field]: value } : topic
              )
            }
          : subject
      )
    );
  };

  // Função para atualizar a configuração de estudo
  const updateStudyConfig = (newConfig: Partial<StudyConfig>) => {
    setStudyConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    } as StudyConfig));
  };

  const applyStudyFilter = (newFilter: Partial<StudyFilter>) => {
    setStudyFilter(prevFilter => ({
      ...prevFilter,
      ...newFilter
    }));
  };

  // Função para obter os subjects filtrados
  const getFilteredSubjects = (): Subject[] => {
    return subjects.filter(subject => {
      // Aplica filtros aqui
      return true; // Retorna true se o subject passar nos filtros
    });
  };

  // Função para processar e converter os dados para o formato adequado para o Supabase
  const processSubjectsForStorage = (subjects: Subject[]): AnyObject => {
    // Converte os objetos complexos para um formato mais simples para armazenamento
    return subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      rating: subject.rating,
      topics: subject.topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        topic: topic.topic,
        isDone: topic.isDone,
        isReviewed: topic.isReviewed,
        importance: topic.importance,
        link: topic.link,
        difficulty: topic.difficulty,
        exercisesDone: topic.exercisesDone,
        hits: topic.hits,
        errors: topic.errors,
        performance: topic.performance
      }))
    }));
  };

  // Função para salvar todos os dados no banco de dados
  const saveAllDataToDatabase = async (): Promise<boolean> => {
    if (!user || !courseId || !studyConfig) return false;

    try {
      await saveProgressToSupabase(
        courseId, 
        subjects, 
        studyConfig.performanceGoal, 
        studyConfig.examDate
      );
      return true;
    } catch (error) {
      console.error('Erro ao salvar todos os dados:', error);
      return false;
    }
  };

  // Função para salvar progresso no Supabase
  const saveProgressToSupabase = async (courseId: string, subjects: Subject[], performanceGoal: number, examDate: Date | null) => {
    if (!user) return;

    try {
      // Pré-processar os subjects para um formato que o Supabase aceita
      const processedSubjects = processSubjectsForStorage(subjects);
      
      // Verificar se já existe um registro para este usuário e curso
      const { data: existingProgress } = await supabase
        .from('user_course_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingProgress) {
        // Update
        const { error } = await supabase
          .from('user_course_progress')
          .update({
            subjects_data: processedSubjects as unknown as Json,
            performance_goal: performanceGoal,
            exam_date: examDate ? examDate.toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
          
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('user_course_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            subjects_data: processedSubjects as unknown as Json,
            performance_goal: performanceGoal,
            exam_date: examDate ? examDate.toISOString() : null
          });
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      throw error;
    }
  };

  return {
    subjects,
    studyConfig,
    studyFilter,
    loading,
    error,
    updateTopicStatus,
    updateTopicProgress,
    updateStudyConfig,
    applyStudyFilter,
    getFilteredSubjects,
    saveProgressToSupabase,
    forceRefresh,
    saveAllDataToDatabase
  };
};
