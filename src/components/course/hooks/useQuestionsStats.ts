
import { supabase } from '@/integrations/supabase/client';
import { LessonStatsData } from '../types/lessonTypes';

export const useQuestionsStats = () => {
  const fetchQuestionsIds = async (lessonId: string): Promise<string[]> => {
    try {
      // Buscar por aula_id
      const { data: questoesData1, error: questoesError1 } = await supabase
        .from('questoes')
        .select('id')
        .eq('aula_id', lessonId);

      if (questoesData1 && questoesData1.length > 0 && !questoesError1) {
        return questoesData1.map(q => String(q.id));
      }

      // Buscar por id_aula
      const { data: questoesData2, error: questoesError2 } = await supabase
        .from('questoes')
        .select('id')
        .eq('id_aula', lessonId);

      if (questoesData2 && questoesData2.length > 0 && !questoesError2) {
        return questoesData2.map(q => String(q.id));
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
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas_alunos')
        .select('questao_id, is_correta, created_at')
        .eq('aluno_id', userId)
        .in('questao_id', questoesIds)
        .order('created_at', { ascending: false });

      if (!respostasData || respostasError) {
        return { total: 0, hits: 0, errors: 0 };
      }

      const respostasMaisRecentes = new Map<string, boolean>();

      for (const resposta of respostasData) {
        if (!respostasMaisRecentes.has(String(resposta.questao_id))) {
          respostasMaisRecentes.set(String(resposta.questao_id), !!resposta.is_correta);
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
