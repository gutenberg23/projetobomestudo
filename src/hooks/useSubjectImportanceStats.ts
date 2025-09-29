import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/components/course/types/editorialized';

interface ImportanceStats {
  subjectId: string;
  percentage: number;
  rawCount: number;
}

interface UserAnswerStats {
  totalAttempts: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export const useSubjectImportanceStats = (subjects: Subject[], currentUserId?: string) => {
  const [importanceStats, setImportanceStats] = useState<Record<string, ImportanceStats>>({});
  const [userStats, setUserStats] = useState<Record<string, UserAnswerStats>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subjects.length === 0) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Buscar dados de importância das disciplinas
        const subjectIds = subjects.map(s => s.id.toString());
        const { data: disciplinas, error } = await supabase
          .from('disciplinaverticalizada')
          .select('id, quantidade_questoes_filtro')
          .in('id', subjectIds);

        if (error) {
          console.error('Erro ao buscar dados de importância:', error);
          return;
        }

        // Calcular percentuais de importância
        const totalQuestions = disciplinas?.reduce((sum, d) => {
          const count = Array.isArray(d.quantidade_questoes_filtro) 
            ? d.quantidade_questoes_filtro.reduce((a, b) => a + b, 0)
            : 0;
          return sum + count;
        }, 0) || 0;

        const importanceData: Record<string, ImportanceStats> = {};
        disciplinas?.forEach(disciplina => {
          const rawCount = Array.isArray(disciplina.quantidade_questoes_filtro)
            ? disciplina.quantidade_questoes_filtro.reduce((a, b) => a + b, 0)
            : 0;
          
          importanceData[disciplina.id] = {
            subjectId: disciplina.id,
            percentage: totalQuestions > 0 ? Math.round((rawCount / totalQuestions) * 100) : 0,
            rawCount
          };
        });

        setImportanceStats(importanceData);

        // Se houver usuário logado, buscar estatísticas de respostas
        if (currentUserId) {
          await fetchUserAnswerStats(disciplinas || [], currentUserId);
        }

      } catch (error) {
        console.error('Erro ao processar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [subjects, currentUserId]);

  const fetchUserAnswerStats = async (disciplinas: any[], userId: string) => {
    try {
      const userStatsData: Record<string, UserAnswerStats> = {};

      // Para cada disciplina, buscar dados dos filtros e calcular estatísticas
      for (const disciplina of disciplinas) {
        const { data: disciplinaCompleta } = await supabase
          .from('disciplinaverticalizada')
          .select('*')
          .eq('id', disciplina.id)
          .single();

        if (!disciplinaCompleta) continue;

        // Construir query baseada nos filtros da disciplina
        let query = supabase
          .from('respostas_alunos')
          .select('is_correta')
          .eq('aluno_id', userId);

        // Aplicar filtros
        if (disciplinaCompleta.disciplinas_filtro?.length > 0) {
          query = query.in('disciplina', disciplinaCompleta.disciplinas_filtro);
        }

        if (disciplinaCompleta.bancas_filtro?.length > 0) {
          query = query.in('banca', disciplinaCompleta.bancas_filtro);
        }

        if (disciplinaCompleta.topicos_filtro?.length > 0) {
          query = query.overlaps('topicos', disciplinaCompleta.topicos_filtro.flat());
        }

        if (disciplinaCompleta.assuntos?.length > 0) {
          query = query.overlaps('assuntos', disciplinaCompleta.assuntos.flat());
        }

        const { data: respostas, error } = await query;

        if (!error && respostas) {
          const totalAttempts = respostas.length;
          const correctAnswers = respostas.filter(r => r.is_correta).length;
          const wrongAnswers = totalAttempts - correctAnswers;

          userStatsData[disciplina.id] = {
            totalAttempts,
            correctAnswers,
            wrongAnswers
          };
        }
      }

      setUserStats(userStatsData);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
    }
  };

  return {
    importanceStats,
    userStats,
    loading
  };
};