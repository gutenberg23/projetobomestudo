import { supabase } from '@/integrations/supabase/client';

export type RankingPeriod = 'week' | 'month' | 'all';

export interface QuestionRankingUser {
  ranking_position: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_attempts: number;
  correct_answers: number;
  wrong_answers: number;
  success_rate: number;
}

export interface SimuladoRankingUser {
  ranking_position: number;
  user_id: string;
  nome: string | null;
  acertos: number;
  erros: number;
  aproveitamento: number;
  created_at: string;
}

/**
 * Verifica se a tabela user_question_attempts existe
 */
const checkTableExists = async (): Promise<boolean> => {
  try {
    // Pular a verificação usando a função SQL que está com problemas
    // e ir direto para o método alternativo
    
    // Tentativa alternativa: buscar uma linha da tabela com limit 0
    // Isso gerará um erro específico se a tabela não existir
    const { error: testError } = await supabase
      .from('user_question_attempts')
      .select('id')
      .limit(0);
    
    if (testError) {
      // Código '42P01' indica "relation does not exist" no PostgreSQL
      if (testError.code === '42P01') {
        console.warn('Tabela user_question_attempts não existe');
        return false;
      }
      console.warn('Erro ao verificar tabela, mas não é erro de tabela inexistente:', testError);
      // Outros erros (como permissão) podem significar que a tabela existe
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar se tabela existe:', error);
    return false;
  }
};

/**
 * Busca o ranking de usuários por questões respondidas
 * @param period Período para filtrar o ranking: 'week' (semanal), 'month' (mensal), 'all' (todos os tempos)
 */
export const fetchQuestionAttemptsRanking = async (period: RankingPeriod = 'all'): Promise<QuestionRankingUser[]> => {
  try {
    // Verifica se a tabela existe antes de tentar buscar os dados
    const tableExists = await checkTableExists();
    if (!tableExists) {
      console.warn('A tabela de tentativas de questões não existe. O ranking não pode ser gerado.');
      return [];
    }
    
    console.log(`Tentando buscar ranking de questões para o período: ${period}`);
    
    // Tenta buscar os dados do ranking com a nova função que aceita período
    try {
      // Primeiro tenta usar a função com filtragem por período
      const { data, error } = await supabase.rpc('get_question_attempts_ranking_by_period', {
        in_period: period
      });

      if (error) {
        console.warn('A função get_question_attempts_ranking_by_period não está disponível, usando a função padrão:', error);
        throw error; // Lançar erro para cair no fallback
      }

      console.log(`Ranking obtido com sucesso para o período ${period}, número de itens:`, data?.length || 0);
      
      // O Supabase pode retornar `null` se a função não retornar linhas.
      return (data as QuestionRankingUser[] | null) || [];
    } catch (error) {
      // Fallback: usar a função original sem filtro de período
      console.log('Usando função de ranking sem filtro de período (fallback)');
      try {
        const { data, error: fallbackError } = await supabase.rpc('get_question_attempts_ranking');

        if (fallbackError) {
          // Erros comuns que podem ocorrer
          if (fallbackError.code === '42883') { // função não existe
            console.error('A função get_question_attempts_ranking não existe:', fallbackError);
          } else if (fallbackError.code === '42P01') { // tabela não existe
            console.error('A tabela user_question_attempts não existe:', fallbackError);
          } else {
            console.error('Erro ao buscar ranking de questões:', fallbackError);
          }
          return [];
        }

        console.log('Ranking obtido com sucesso usando função fallback, número de itens:', data?.length || 0);
        
        return (data as QuestionRankingUser[] | null) || [];
      } catch (fallbackError) {
        console.error('Erro no método fallback:', fallbackError);
        return [];
      }
    }

  } catch (error) {
    console.error('Exceção ao buscar ranking de questões:', error);
    return []; // Retornar array vazio em caso de exceção
  }
};

/**
 * Busca o ranking de usuários em um simulado específico
 */
export const fetchSimuladoRanking = async (simuladoId: string): Promise<SimuladoRankingUser[]> => {
  try {
    const { data, error } = await supabase.rpc('get_simulado_ranking', { p_simulado_id: simuladoId });

    if (error) {
      console.error('Erro ao buscar ranking do simulado:', error);
      return [];
    }

    return (data as SimuladoRankingUser[] | null) || [];

  } catch (error) {
    console.error('Exceção ao buscar ranking do simulado:', error);
    return [];
  }
}; 