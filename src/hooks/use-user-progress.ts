import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Topic } from '@/components/course/types/editorialized';
import { Database } from '@/types/supabase';

type UserCourseProgress = Database['public']['Tables']['user_course_progress']['Row'];

interface SubjectData {
  topics: Topic[];
  id: string | number;
  name: string;
}

interface UserProgress {
  subjects_data: Record<string, SubjectData>;
  performance_goal: number;
  exam_date: string | null;
}

const LOCAL_STORAGE_KEY = 'user_course_progress';

export const useUserProgress = (courseId: string) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadFromLocalStorage = (): UserProgress | null => {
    try {
      const key = `${LOCAL_STORAGE_KEY}_${courseId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  };

  const saveToLocalStorage = (data: UserProgress) => {
    try {
      const key = `${LOCAL_STORAGE_KEY}_${courseId}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const loadFromSupabase = async (userId: string): Promise<UserProgress | null> => {
    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select()
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          subjects_data: data.subjects_data as Record<string, SubjectData>,
          performance_goal: data.performance_goal,
          exam_date: data.exam_date
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar progresso do Supabase:', error);
      return null;
    }
  };

  const saveToSupabase = async (userId: string, data: UserProgress) => {
    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: userId,
          course_id: courseId,
          subjects_data: data.subjects_data,
          performance_goal: data.performance_goal,
          exam_date: data.exam_date,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar progresso no Supabase:', error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar seu progresso. Seus dados foram salvos localmente.",
        variant: "destructive"
      });
    }
  };

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;

      let progressData = null;

      if (userId) {
        progressData = await loadFromSupabase(userId);
      }

      if (!progressData) {
        progressData = loadFromLocalStorage();
      }

      if (progressData) {
        setProgress(progressData);
        saveToLocalStorage(progressData);
      } else {
        // Initialize with default values if no data exists
        const defaultProgress: UserProgress = {
          subjects_data: {},
          performance_goal: 85,
          exam_date: null
        };
        setProgress(defaultProgress);
        saveToLocalStorage(defaultProgress);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (newData: Partial<UserProgress>) => {
    const updatedProgress = {
      ...progress,
      ...newData
    } as UserProgress;

    setProgress(updatedProgress);
    saveToLocalStorage(updatedProgress);

    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;

    if (userId) {
      await saveToSupabase(userId, updatedProgress);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [courseId]);

  return {
    progress,
    isLoading,
    updateProgress
  };
};
