
import { supabase } from "@/integrations/supabase/client";

// Interface para representar as tentativas de questões do usuário
export interface UserQuestionAttempt {
  questionId: string;
  isCorrect: boolean;
}

// Função para buscar todas as tentativas únicas de questões de um usuário
export const fetchUserQuestionAttempts = async (userId: string): Promise<UserQuestionAttempt[]> => {
  if (!userId || userId === 'guest') {
    return [];
  }

  try {
    // Verificar se a tabela user_question_attempts existe usando uma consulta SQL direta
    const { data: tableExists, error: tableCheckError } = await supabase
      .rpc('table_exists', { table_name: 'user_question_attempts' }) as any;

    // Se a tabela não existir, buscar das respostas_alunos
    if (tableCheckError || !tableExists) {
      console.log('Tabela user_question_attempts não encontrada, buscando de respostas_alunos');
      return fetchFromRespostasAlunos(userId);
    }

    // Buscar todas as tentativas únicas do usuário
    const { data, error } = await supabase
      .from('user_question_attempts')
      .select('question_id, is_correct')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao buscar tentativas de questões:', error);
      return fetchFromRespostasAlunos(userId);
    }

    if (!data || data.length === 0) {
      // Se não encontrou dados na nova tabela, buscar da tabela antiga
      return fetchFromRespostasAlunos(userId);
    }

    // Converter para o formato da interface
    return data.map(item => ({
      questionId: item.question_id as string,
      isCorrect: item.is_correct as boolean
    }));
  } catch (error) {
    console.error('Erro ao buscar tentativas de questões:', error);
    return [];
  }
};

// Função para buscar tentativas de questões da tabela respostas_alunos
const fetchFromRespostasAlunos = async (userId: string): Promise<UserQuestionAttempt[]> => {
  try {
    // Buscar todas as respostas do aluno
    const { data, error } = await supabase
      .from('respostas_alunos')
      .select('questao_id, is_correta, created_at')
      .eq('aluno_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar respostas do aluno:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Criar um Map para armazenar apenas a tentativa mais recente de cada questão
    const uniqueAttempts = new Map<string, boolean>();
    
    // Percorrer todas as respostas e manter apenas a mais recente para cada questão
    data.forEach(item => {
      if (!uniqueAttempts.has(item.questao_id)) {
        uniqueAttempts.set(item.questao_id, item.is_correta);
      }
    });

    // Converter o Map para um array de objetos
    return Array.from(uniqueAttempts.entries()).map(([questionId, isCorrect]) => ({
      questionId,
      isCorrect
    }));
  } catch (error) {
    console.error('Erro ao buscar respostas do aluno:', error);
    return [];
  }
};

// Função para salvar uma nova tentativa de questão
export const saveUserQuestionAttempt = async (
  userId: string,
  questionId: string,
  isCorrect: boolean
): Promise<boolean> => {
  if (!userId || userId === 'guest') {
    return false;
  }

  try {
    // Verificar se a tabela user_question_attempts existe
    const { data: tableExists, error: tableCheckError } = await supabase
      .rpc('table_exists', { table_name: 'user_question_attempts' }) as any;

    // Se a tabela não existir, salvar apenas em respostas_alunos
    if (tableCheckError || !tableExists) {
      console.log('Tabela user_question_attempts não encontrada, salvando apenas em respostas_alunos');
      return true;
    }

    // Usando rpc personalizada para upsert
    const { error } = await supabase
      .rpc('upsert_user_question_attempt', {
        p_user_id: userId,
        p_question_id: questionId,
        p_is_correct: isCorrect
      }) as any;

    if (error) {
      console.error('Erro ao salvar tentativa de questão:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar tentativa de questão:', error);
    return false;
  }
};

// Função para calcular estatísticas de questões para um usuário
export const calculateUserQuestionStats = (attempts: UserQuestionAttempt[]) => {
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(attempt => attempt.isCorrect).length;
  const wrongAnswers = totalQuestions - correctAnswers;

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers
  };
};
