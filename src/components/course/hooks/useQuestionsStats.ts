
import { supabase } from '@/integrations/supabase/client';
import { LessonStatsData } from '../types/lessonTypes';

// Define explicit types for Supabase results
interface QuestaoResult {
  id: string;
}

interface RespostaAluno {
  questao_id: string;
  is_correta: boolean;
  created_at: string;
}

export const useQuestionsStats = () => {
  const fetchQuestionsIds = async (lessonId: string): Promise<string[]> => {
    try {
      const campos = ['aula_id', 'id_aula'];
      for (const campo of campos) {
        try {
          const { data, error } = await supabase
            .from('questoes')
            .select('id')
            .eq(campo, lessonId);

          if (!error && data?.length) {
            return data.map((q: QuestaoResult) => q.id);
          }
        } catch (err) {
          console.error(`Erro ao buscar IDs por ${campo}:`, err);
        }
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar IDs de questões:', error);
      return [];
    }
  };

  const calculateLessonStats = async (questoesIds: string[], userId: string): Promise<LessonStatsData> => {
    if (!questoesIds.length || !userId) {
      return { total: 0, hits: 0, errors: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('respostas_alunos')
        .select('questao_id, is_correta, created_at')
        .eq('aluno_id', userId)
        .in('questao_id', questoesIds)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return { total: 0, hits: 0, errors: 0 };
      }

      const respostasMaisRecentes = new Map<string, boolean>();
      const respostas = data as RespostaAluno[];
      
      for (const resposta of respostas) {
        if (!respostasMaisRecentes.has(resposta.questao_id)) {
          respostasMaisRecentes.set(resposta.questao_id, resposta.is_correta);
        }
      }

      const total = respostasMaisRecentes.size;
      const hits = Array.from(respostasMaisRecentes.values()).filter(Boolean).length;

      return {
        total,
        hits,
        errors: total - hits
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas da aula:', error);
      return { total: 0, hits: 0, errors: 0 };
    }
  };

  return { fetchQuestionsIds, calculateLessonStats };
};
