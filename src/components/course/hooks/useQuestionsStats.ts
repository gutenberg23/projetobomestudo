
import { supabase } from '@/integrations/supabase/client';
import { LessonStatsData } from '../types/lessonTypes';

// Tipos explícitos para os dados retornados do Supabase
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
      // Buscar por diferentes nomes de colunas
      for (const field of ['aula_id', 'id_aula']) {
        const { data, error } = await supabase
          .from('questoes')
          .select('id')
          .eq(field, lessonId);

        if (error) {
          console.error(`Erro ao buscar questões por ${field}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          return data.map(q => q.id as string);
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

      if (error) {
        console.error('Erro ao buscar respostas:', error);
        return { total: 0, hits: 0, errors: 0 };
      }

      const respostasMaisRecentes = new Map<string, boolean>();

      for (const resposta of data ?? []) {
        if (!respostasMaisRecentes.has(resposta.questao_id)) {
          respostasMaisRecentes.set(resposta.questao_id, !!resposta.is_correta);
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
