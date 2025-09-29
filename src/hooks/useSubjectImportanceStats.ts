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
        console.log('Iniciando busca de estatísticas de importância para subjects:', subjects);
        
        // Buscar dados de importância das disciplinas
        const subjectIds = subjects.map(s => s.id.toString());
        console.log('IDs das disciplinas a buscar:', subjectIds);
        
        // CORREÇÃO: Buscar a coluna correta 'quantidade_questoes_filtro' em vez de 'importancia'
        const { data: disciplinas, error } = await supabase
          .from('disciplinaverticalizada')
          .select('id, titulo, quantidade_questoes_filtro')
          .in('id', subjectIds);

        if (error) {
          console.error('Erro ao buscar dados de importância:', error);
          return;
        }

        console.log('Disciplinas buscadas do banco:', disciplinas);

        // Calcular percentuais de importância para cada disciplina individualmente
        const importanceData: Record<string, ImportanceStats> = {};
        
        disciplinas?.forEach(disciplina => {
          console.log(`Processando disciplina ${disciplina.id}:`, disciplina);
          
          // Verificar se quantidade_questoes_filtro existe e é um array
          if (!Array.isArray(disciplina.quantidade_questoes_filtro)) {
            console.warn(`Dados de quantidade_questoes_filtro inválidos para disciplina ${disciplina.id}:`, disciplina.quantidade_questoes_filtro);
            // Criar entrada com valores zerados
            importanceData[disciplina.id] = {
              subjectId: disciplina.id,
              percentage: 100,
              rawCount: 0
            };
            return;
          }

          // Calcular o total de questões para esta disciplina
          const totalQuestions = disciplina.quantidade_questoes_filtro.reduce((sum, value) => sum + (value || 0), 0);
          console.log(`Total de questões para ${disciplina.id}:`, totalQuestions);

          // Para cada tópico, calcular sua porcentagem em relação ao total da disciplina
          disciplina.quantidade_questoes_filtro.forEach((questionCount, index) => {
            const percentage = totalQuestions > 0 
              ? Math.round(((questionCount || 0) / totalQuestions) * 100)
              : 0;
            
            // Criar uma chave única para cada tópico da disciplina
            const topicKey = `${disciplina.id}-${index}`;
            importanceData[topicKey] = {
              subjectId: disciplina.id,
              percentage,
              rawCount: questionCount || 0
            };
            
            console.log(`Tópico ${index} da disciplina ${disciplina.id}: ${questionCount} (${percentage}%)`);
          });
          
          // Também armazenar o total da disciplina
          importanceData[disciplina.id] = {
            subjectId: disciplina.id,
            percentage: 100, // A disciplina como um todo é 100%
            rawCount: totalQuestions
          };
        });

        console.log('Dados de importância processados:', importanceData);
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