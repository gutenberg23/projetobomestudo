import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/components/course/types/editorialized';
import {
  QuestionFilterSet,
  QuestionMeta,
  hasAnyFilter,
  questionMatchesFilters,
  resolveTopicFilters,
} from '@/utils/editalQuestionFilters';

export interface ImportanceStats {
  subjectId: string;
  percentage: number;
  rawCount: number;
}

export interface UserAnswerStats {
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
}

interface DisciplinaRow {
  id: string;
  titulo: string;
  topicos: string[] | null;
  links: string[] | null;
  quantidade_questoes_filtro: number[] | null;
  disciplinas_filtro: string[] | null;
  topicos_filtro: string[] | null;
  bancas_filtro: string[] | null;
  assuntos: string[] | null;
}

interface AnswerRow {
  questao_id: string;
  is_correta: boolean;
  disciplina: string | null;
  banca: string | null;
  assuntos: string[] | null;
  topicos: string[] | null;
}

const PAGE_SIZE = 1000;
const ID_CHUNK = 150;

const emptyStats = (): UserAnswerStats => ({ totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 });

/** Busca todas as respostas do aluno, página por página (o Supabase devolve no máximo 1000 linhas por vez). */
const fetchAllAnswers = async (userId: string): Promise<AnswerRow[]> => {
  const all: AnswerRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('respostas_alunos')
      .select('id, questao_id, is_correta, disciplina, banca, assuntos, topicos')
      .eq('aluno_id', userId)
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    all.push(...((data || []) as AnswerRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return all;
};

/** Busca os dados atuais das questões respondidas, em blocos de ids. */
const fetchQuestionsMeta = async (ids: string[], withContent: boolean): Promise<Map<string, QuestionMeta>> => {
  const columns = 'id, discipline, institution, organization, role, year, level, difficulty, assuntos, topicos' +
    (withContent ? ', content' : '');
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) chunks.push(ids.slice(i, i + ID_CHUNK));

  const results = await Promise.all(
    chunks.map(chunk => supabase.from('questoes').select(columns).in('id', chunk))
  );

  const map = new Map<string, QuestionMeta>();
  results.forEach(({ data, error }) => {
    if (error) throw error;
    (data as unknown as Array<QuestionMeta & { id: string }> | null)?.forEach(q => map.set(q.id, q));
  });
  return map;
};

/**
 * Estatísticas do edital verticalizado: importância de cada tópico e
 * questões feitas, acertos e erros do aluno.
 *
 * As respostas do aluno são cruzadas com os dados atuais de cada questão e
 * com os filtros do link do tópico. Assim, o tópico conta exatamente as
 * questões que aparecem quando o aluno clica no link.
 */
export const useSubjectImportanceStats = (subjects: Subject[], currentUserId?: string) => {
  const [importanceStats, setImportanceStats] = useState<Record<string, ImportanceStats>>({});
  const [userStats, setUserStats] = useState<Record<string, UserAnswerStats>>({});
  const [topicUserStats, setTopicUserStats] = useState<Record<string, UserAnswerStats>>({});
  const [loading, setLoading] = useState(false);

  const subjectKey = subjects.map(s => s.id).join(',');

  useEffect(() => {
    if (subjects.length === 0) return;
    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const subjectIds = subjects.map(s => s.id.toString());

        const { data, error } = await supabase
          .from('disciplinaverticalizada')
          .select('id, titulo, topicos, links, quantidade_questoes_filtro, disciplinas_filtro, topicos_filtro, bancas_filtro, assuntos')
          .in('id', subjectIds);

        if (error) throw error;
        const disciplinas = (data || []) as DisciplinaRow[];

        // Importância: percentual de questões do tópico dentro da disciplina
        const importanceData: Record<string, ImportanceStats> = {};
        disciplinas.forEach(disciplina => {
          const quantities = Array.isArray(disciplina.quantidade_questoes_filtro)
            ? disciplina.quantidade_questoes_filtro
            : [];
          const total = quantities.reduce((sum, value) => sum + (Number(value) || 0), 0);
          const topicCount = Math.max(disciplina.topicos?.length || 0, quantities.length);

          for (let i = 0; i < topicCount; i++) {
            const count = Number(quantities[i]) || 0;
            importanceData[`${disciplina.id}-${i}`] = {
              subjectId: disciplina.id,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0,
              rawCount: count,
            };
          }
          importanceData[disciplina.id] = { subjectId: disciplina.id, percentage: 100, rawCount: total };
        });

        if (cancelled) return;
        setImportanceStats(importanceData);

        if (!currentUserId) {
          setUserStats({});
          setTopicUserStats({});
          return;
        }

        // Filtros de cada tópico (link do tópico primeiro)
        const subjectById = new Map(subjects.map(s => [s.id.toString(), s]));
        const topicFilters: Array<{ key: string; disciplinaId: string; filters: QuestionFilterSet }> = [];
        disciplinas.forEach(disciplina => {
          const subject = subjectById.get(disciplina.id);
          const topicCount = Math.max(disciplina.topicos?.length || 0, subject?.topics.length || 0);
          for (let i = 0; i < topicCount; i++) {
            const link = disciplina.links?.[i] || subject?.topics[i]?.link || null;
            topicFilters.push({
              key: `${disciplina.id}-${i}`,
              disciplinaId: disciplina.id,
              filters: resolveTopicFilters(link, disciplina, i),
            });
          }
        });

        const answers = await fetchAllAnswers(currentUserId);
        const questionIds = [...new Set(answers.map(a => a.questao_id))];
        const needsContent = topicFilters.some(t => !!t.filters.q);
        const metaById = questionIds.length > 0
          ? await fetchQuestionsMeta(questionIds, needsContent)
          : new Map<string, QuestionMeta>();

        // Agrupar respostas por questão
        const answersByQuestion = new Map<string, { total: number; correct: number; meta: QuestionMeta }>();
        answers.forEach(answer => {
          let entry = answersByQuestion.get(answer.questao_id);
          if (!entry) {
            // Se a questão não existe mais, usar os dados gravados na resposta
            const meta: QuestionMeta = metaById.get(answer.questao_id) || {
              discipline: answer.disciplina,
              institution: answer.banca,
              assuntos: answer.assuntos,
              topicos: answer.topicos,
            };
            entry = { total: 0, correct: 0, meta };
            answersByQuestion.set(answer.questao_id, entry);
          }
          entry.total += 1;
          if (answer.is_correta) entry.correct += 1;
        });

        const topicStatsData: Record<string, UserAnswerStats> = {};
        const userStatsData: Record<string, UserAnswerStats> = {};
        disciplinas.forEach(d => { userStatsData[d.id] = emptyStats(); });

        topicFilters.forEach(({ key, disciplinaId, filters }) => {
          const stats = emptyStats();
          if (hasAnyFilter(filters)) {
            answersByQuestion.forEach(entry => {
              if (questionMatchesFilters(filters, entry.meta)) {
                stats.totalAttempts += entry.total;
                stats.correctAnswers += entry.correct;
              }
            });
            stats.wrongAnswers = stats.totalAttempts - stats.correctAnswers;
          }
          topicStatsData[key] = stats;

          const subjectTotals = userStatsData[disciplinaId];
          subjectTotals.totalAttempts += stats.totalAttempts;
          subjectTotals.correctAnswers += stats.correctAnswers;
          subjectTotals.wrongAnswers += stats.wrongAnswers;
        });

        if (cancelled) return;
        setUserStats(userStatsData);
        setTopicUserStats(topicStatsData);
      } catch (error) {
        console.error('Erro ao calcular estatísticas do edital:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectKey, currentUserId]);

  return {
    importanceStats,
    userStats,
    topicUserStats,
    loading,
  };
};
