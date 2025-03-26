import { calculateSubjectTotals } from '../utils/statsCalculations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSubjectStats = (subject: any, lessons: any[]) => {
  const { user } = useAuth();

  const getSubjectStats = async () => {
    try {
      console.log('Calculando estatísticas para disciplina:', subject.name || subject.titulo);
      console.log('Aulas disponíveis:', lessons);
      
      // Primeiro, vamos coletar todos os IDs de questões desta disciplina
      const questoesIds = new Set<string>();
      const questoesPorTopico = new Map<string, Set<string>>();
      
      // Para cada aula, buscar questões diretas e dos tópicos
      for (const lesson of lessons) {
        // Adicionar questões diretas da aula
        if (lesson.questoesIds && Array.isArray(lesson.questoesIds)) {
          lesson.questoesIds.forEach((id: string) => questoesIds.add(id));
        }

        // Buscar questões dos tópicos da aula
        if (lesson.topicosIds && Array.isArray(lesson.topicosIds)) {
          const { data: topicos, error: topicosError } = await supabase
            .from('topicos')
            .select('id, questoes_ids')
            .in('id', lesson.topicosIds);

          if (topicosError) {
            console.error('Erro ao buscar tópicos:', topicosError);
            continue;
          }

          // Adicionar questões de cada tópico
          topicos?.forEach(topico => {
            if (topico.questoes_ids && Array.isArray(topico.questoes_ids)) {
              // Adicionar ao Set geral
              topico.questoes_ids.forEach(id => questoesIds.add(id));
              
              // Adicionar ao Map de questões por tópico
              if (!questoesPorTopico.has(topico.id)) {
                questoesPorTopico.set(topico.id, new Set());
              }
              topico.questoes_ids.forEach(id => questoesPorTopico.get(topico.id)?.add(id));
            }
          });
        }
      }

      console.log('IDs de questões encontrados:', Array.from(questoesIds));
      console.log('Questões por tópico:', Object.fromEntries(questoesPorTopico));

      if (!user?.id) {
        console.log('Usuário não está logado');
        return {
          progress: 0,
          questionsTotal: 0,
          questionsCorrect: 0,
          questionsWrong: 0,
          aproveitamento: 0,
          topicoStats: {}
        };
      }

      // Buscar todas as respostas para estas questões do aluno atual
      const { data: respostasData, error: respostasError } = await supabase
        .from('respostas_alunos')
        .select('questao_id, is_correta, created_at')
        .eq('aluno_id', user.id)
        .in('questao_id', Array.from(questoesIds))
        .order('created_at', { ascending: false });

      if (respostasError) {
        console.error('Erro ao buscar respostas:', respostasError);
        throw respostasError;
      }

      console.log('Respostas encontradas:', respostasData);

      // Agrupar respostas por questão e pegar apenas a mais recente
      const respostasPorQuestao = new Map<string, boolean>();
      
      respostasData?.forEach(resposta => {
        if (!respostasPorQuestao.has(resposta.questao_id)) {
          respostasPorQuestao.set(resposta.questao_id, resposta.is_correta);
        }
      });

      console.log('Respostas mais recentes por questão:', Object.fromEntries(respostasPorQuestao));

      // Calcular totais da disciplina
      const questionsCorrect = Array.from(respostasPorQuestao.values()).filter(isCorrect => isCorrect).length;
      const questionsWrong = respostasPorQuestao.size - questionsCorrect;
      const questionsTotal = questionsCorrect + questionsWrong;

      // Calcular totais por tópico
      const topicoStats = new Map<string, { correct: number; wrong: number }>();
      
      questoesPorTopico.forEach((questoesDoTopico, topicoId) => {
        let correct = 0;
        let wrong = 0;
        
        questoesDoTopico.forEach(questaoId => {
          if (respostasPorQuestao.has(questaoId)) {
            if (respostasPorQuestao.get(questaoId)) {
              correct++;
            } else {
              wrong++;
            }
          }
        });
        
        topicoStats.set(topicoId, { correct, wrong });
      });

      console.log('Estatísticas por tópico:', Object.fromEntries(topicoStats));
      console.log('Estatísticas da disciplina:', {
        questionsTotal,
        questionsCorrect,
        questionsWrong,
        aproveitamento: questionsTotal > 0 ? Math.round((questionsCorrect / questionsTotal) * 100) : 0
      });

      return {
        progress: subject.progress || 0,
        questionsTotal,
        questionsCorrect,
        questionsWrong,
        aproveitamento: questionsTotal > 0 
          ? Math.round((questionsCorrect / questionsTotal) * 100) 
          : 0,
        topicoStats: Object.fromEntries(topicoStats)
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        progress: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        questionsWrong: 0,
        aproveitamento: 0,
        topicoStats: {}
      };
    }
  };

  return { getSubjectStats };
};
