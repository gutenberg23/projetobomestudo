
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type QuestionStat = {
  questionId: string;
  correct: number;
  incorrect: number;
  total: number;
};

export const useQuestionsStats = (initialQuestionIds: string[] = []) => {
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    hits: 0,
    errors: 0
  });

  // Função para buscar IDs de questões relacionadas a uma aula
  const fetchQuestionsIds = useCallback(async (lessonId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('questoes_ids')
        .eq('id', lessonId)
        .single();

      if (error) {
        console.error('Erro ao buscar IDs de questões:', error);
        return [];
      }

      return Array.isArray(data?.questoes_ids) ? data.questoes_ids : [];
    } catch (error) {
      console.error('Erro ao buscar IDs de questões:', error);
      return [];
    }
  }, []);

  // Função para calcular estatísticas de uma aula com base nos IDs de questões
  const calculateLessonStats = useCallback(async (qIds: string[], userId?: string): Promise<{total: number; hits: number; errors: number}> => {
    if (!qIds.length) {
      return { total: 0, hits: 0, errors: 0 };
    }

    try {
      // Se tiver userId, buscar apenas as respostas desse usuário
      let query = supabase
        .from('respostas_alunos')
        .select('questao_id, is_correta');
      
      if (userId) {
        query = query.eq('aluno_id', userId);
      }
      
      const { data, error } = await query.in('questao_id', qIds);

      if (error) {
        console.error('Erro ao buscar respostas para as questões:', error);
        return { total: 0, hits: 0, errors: 0 };
      }

      if (!data || data.length === 0) {
        return { total: 0, hits: 0, errors: 0 };
      }

      const hits = data.filter(r => r.is_correta).length;
      const errors = data.filter(r => !r.is_correta).length;
      const total = hits + errors;

      return { total, hits, errors };
    } catch (error) {
      console.error('Erro ao calcular estatísticas da aula:', error);
      return { total: 0, hits: 0, errors: 0 };
    }
  }, []);

  useEffect(() => {
    // Só executamos se realmente tivermos IDs de questões iniciais para evitar consultas desnecessárias
    if (initialQuestionIds && initialQuestionIds.length > 0) {
      const fetchStats = async () => {
        setLoading(true);
        
        try {
          // Buscar estatísticas das questões
          const { data: respostasData, error: respostasError } = await supabase
            .from('respostas_alunos')
            .select('questao_id, is_correta')
            .in('questao_id', initialQuestionIds);

          if (respostasError) {
            throw respostasError;
          }

          // Agrupar as respostas por questão
          const statsMap = new Map<string, { correct: number; incorrect: number }>();
          
          initialQuestionIds.forEach(id => {
            statsMap.set(id, { correct: 0, incorrect: 0 });
          });

          (respostasData || []).forEach(resposta => {
            const current = statsMap.get(resposta.questao_id) || { correct: 0, incorrect: 0 };
            
            if (resposta.is_correta) {
              current.correct += 1;
            } else {
              current.incorrect += 1;
            }
            
            statsMap.set(resposta.questao_id, current);
          });

          // Converter o mapa em um array
          const statsArray = Array.from(statsMap.entries()).map(([questionId, data]) => ({
            questionId,
            correct: data.correct,
            incorrect: data.incorrect,
            total: data.correct + data.incorrect
          }));

          // Calcular totais
          const hits = statsArray.reduce((sum, stat) => sum + stat.correct, 0);
          const errors = statsArray.reduce((sum, stat) => sum + stat.incorrect, 0);
          const total = hits + errors;

          setStats(statsArray);
          setTotalStats({ total, hits, errors });
        } catch (error) {
          console.error('Erro ao buscar estatísticas das questões:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    } else {
      // Se não houver questões, apenas resetamos os estados para evitar dados desatualizados
      setStats([]);
      setTotalStats({ total: 0, hits: 0, errors: 0 });
      setLoading(false);
    }
  }, [initialQuestionIds.join(',')]); // Usando join para evitar dependência profunda que causa re-renders excessivos

  return { 
    stats, 
    totalStats, 
    loading, 
    fetchQuestionsIds, 
    calculateLessonStats 
  };
};
