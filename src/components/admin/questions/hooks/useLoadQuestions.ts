import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Question = {
  id: string;
  user_id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questiontype: string;
  content: string;
  teacherexplanation: string | null;
  aiexplanation: string | null;
  expandablecontent: string | null;
  options: any;
  topicos: string[];
  created_at: string;
  updated_at: string;
};

type Filters = {
  level?: string;
  difficulty?: string;
};

export const useLoadQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [levels, setLevels] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const loadFilterOptions = async () => {
    try {
      // Carregar níveis únicos
      const { data: levelData, error: levelError } = await supabase
        .from('questoes')
        .select('level')
        .not('level', 'is', null)
        .not('level', 'eq', '');

      if (levelError) {
        throw levelError;
      }

      if (levelData) {
        const uniqueLevels = Array.from(new Set(levelData.map(item => item.level)))
          .filter(Boolean)
          .sort();
        setLevels(uniqueLevels);
      }

      // Carregar dificuldades únicas
      const { data: difficultyData, error: difficultyError } = await supabase
        .from('questoes')
        .select('difficulty')
        .not('difficulty', 'is', null)
        .not('difficulty', 'eq', '');

      if (difficultyError) {
        throw difficultyError;
      }

      if (difficultyData) {
        const uniqueDifficulties = Array.from(new Set(difficultyData.map(item => item.difficulty)))
          .filter(Boolean)
          .sort();
        setDifficulties(uniqueDifficulties);
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
      toast.error('Erro ao carregar opções de filtro. Tente novamente.');
    }
  };

  const fetchQuestions = async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      let query = supabase
        .from('questoes')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      // Aplicar paginação após os filtros
      query = query.range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (pageNumber === 1) {
        setQuestions(data || []);
      } else {
        setQuestions(prev => [...prev, ...(data || [])]);
      }

      // Verificar se há mais questões
      setHasMore((data || []).length === pageSize);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      toast.error('Erro ao carregar questões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar opções de filtro ao montar o componente
  useEffect(() => {
    const init = async () => {
      await loadFilterOptions();
      fetchQuestions(1);
    };
    init();
  }, []);

  // Carregar questões quando os filtros mudarem
  useEffect(() => {
    setPage(1);
    fetchQuestions(1);
  }, [filters]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuestions(nextPage);
  };

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    questions,
    loading,
    filters,
    levels,
    difficulties,
    hasMore,
    updateFilters,
    loadMore
  };
}; 