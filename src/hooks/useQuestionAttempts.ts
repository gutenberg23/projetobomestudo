import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useQuestionAttempts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Registra uma tentativa de resposta a uma questão.
   * Usa a função upsert_user_question_attempt para garantir que apenas
   * a tentativa mais recente seja armazenada para cada combinação de usuário e questão.
   */
  const recordQuestionAttempt = async (userId: string, questionId: string, isCorrect: boolean) => {
    if (!userId || !questionId) {
      console.error('userId e questionId são obrigatórios');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Chamar a função RPC que faz o upsert na tabela user_question_attempts
      const { error } = await supabase.rpc('upsert_user_question_attempt', {
        p_user_id: userId,
        p_question_id: questionId,
        p_is_correct: isCorrect
      });

      if (error) {
        console.error('Erro ao registrar tentativa de questão:', error);
        setError(error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exceção ao registrar tentativa de questão:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recordQuestionAttempt,
    isLoading,
    error
  };
}; 