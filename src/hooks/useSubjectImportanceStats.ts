import { useState, useEffect, useMemo } from 'react';
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
  const [topicUserStats, setTopicUserStats] = useState<Record<string, UserAnswerStats>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subjects.length === 0) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Buscar dados de importância das disciplinas
        const subjectIds = subjects.map(s => s.id.toString());
        
        // Verificar se há subjectIds para buscar
        if (subjectIds.length === 0) {
          console.log('Nenhum ID de disciplina para buscar');
          setLoading(false);
          return;
        }
        
        // CORREÇÃO: Buscar a coluna correta 'quantidade_questoes_filtro' em vez de 'importancia'
        const { data: disciplinas, error } = await supabase
          .from('disciplinaverticalizada')
          .select('id, titulo, quantidade_questoes_filtro')
          .in('id', subjectIds);

        if (error) {
          console.error('Erro ao buscar dados de importância:', error);
          setLoading(false);
          return;
        }

        // Calcular percentuais de importância para cada disciplina individualmente
        const importanceData: Record<string, ImportanceStats> = {};
        
        // Verificar se há disciplinas para processar
        if (!disciplinas || disciplinas.length === 0) {
          console.log('Nenhuma disciplina encontrada para calcular importância');
          setImportanceStats(importanceData);
          
          // Se houver usuário logado, buscar estatísticas de respostas
          if (currentUserId) {
            await fetchUserAnswerStats([], currentUserId);
          } else {
            setLoading(false);
          }
          return;
        }
        
        disciplinas?.forEach(disciplina => {
          // Verificar se quantidade_questoes_filtro existe e é um array
          if (!Array.isArray(disciplina.quantidade_questoes_filtro)) {
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
          });
          
          // Também armazenar o total da disciplina
          importanceData[disciplina.id] = {
            subjectId: disciplina.id,
            percentage: 100, // A disciplina como um todo é 100%
            rawCount: totalQuestions
          };
        });

        setImportanceStats(importanceData);

        // Se houver usuário logado, buscar estatísticas de respostas
        if (currentUserId) {
          await fetchUserAnswerStats(disciplinas || [], currentUserId);
        } else {
          // Se não houver usuário logado, definir estatísticas vazias
          setUserStats({});
          setTopicUserStats({});
          setLoading(false);
        }

      } catch (error) {
        console.error('Erro ao processar estatísticas:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [subjects, currentUserId]);

  // Função auxiliar para garantir que temos um array
  const ensureArray = (value: any): any[] => {
    // Verificar se é null ou undefined
    if (value === null || value === undefined) {
      return [];
    }
    
    if (Array.isArray(value)) {
      return value;
    }
    
    if (typeof value === 'string') {
      return [value];
    }
    
    // Para outros tipos, tentar converter para string e depois para array
    return [String(value)];
  };

  const fetchUserAnswerStats = async (disciplinas: any[], userId: string) => {
    try {
      const userStatsData: Record<string, UserAnswerStats> = {};
      const topicStatsData: Record<string, UserAnswerStats> = {};
            
      // Verificar se há disciplinas para processar
      if (!disciplinas || disciplinas.length === 0) {
        console.log('Nenhuma disciplina para processar');
        setUserStats(userStatsData);
        setTopicUserStats(topicStatsData);
        return;
      }

      // Para cada disciplina, buscar dados dos filtros e calcular estatísticas
      for (const disciplina of disciplinas) {
        const { data: disciplinaCompleta, error: disciplinaError } = await supabase
          .from('disciplinaverticalizada')
          .select('*')
          .eq('id', disciplina.id)
          .single();

        if (disciplinaError || !disciplinaCompleta) {
          console.error(`Erro ao buscar dados da disciplina ${disciplina.id}:`, disciplinaError);
          continue;
        }

        // Construir query baseada nos filtros da disciplina para estatísticas gerais da disciplina
        let query = supabase
          .from('respostas_alunos')
          .select('is_correta')
          .eq('aluno_id', userId);
        
        // Verificar se os filtros da disciplina são válidos
        if (!disciplinaCompleta) {
          console.error(`Dados da disciplina ${disciplina.id} estão incompletos`);
          continue;
        }

        // Aplicar filtros da disciplina
        if (disciplinaCompleta.disciplinas_filtro?.length > 0) {
          // Garantir que é um array e achatar
          const disciplinasArray = ensureArray(disciplinaCompleta.disciplinas_filtro);
          const flatDisciplinas = disciplinasArray.flat();
          if (flatDisciplinas.length > 0) {
            // Filtrar valores vazios e formatar corretamente
            const validDisciplinas = flatDisciplinas.filter((d: string) => d && d.trim() !== '');
            if (validDisciplinas.length > 0) {
              query = query.in('disciplina', validDisciplinas);
            }
          }
        }

        if (disciplinaCompleta.bancas_filtro?.length > 0) {
          // Garantir que é um array e achatar
          const bancasArray = ensureArray(disciplinaCompleta.bancas_filtro);
          const flatBancas = bancasArray.flat();
          if (flatBancas.length > 0) {
            // Filtrar valores vazios e formatar corretamente
            const validBancas = flatBancas.filter((b: string) => b && b.trim() !== '');
            if (validBancas.length > 0) {
              query = query.in('banca', validBancas);
            }
          }
        }

        if (disciplinaCompleta.topicos_filtro?.length > 0) {
          // Garantir que é um array e achatar
          const topicosArray = ensureArray(disciplinaCompleta.topicos_filtro);
          const flatTopicos = topicosArray.flat();
          if (flatTopicos.length > 0) {
            // Filtrar valores vazios e formatar corretamente
            const validTopicos = flatTopicos.filter((t: string) => t && t.trim() !== '');
            if (validTopicos.length > 0) {
              query = query.overlaps('topicos', validTopicos);
            }
          }
        }

        if (disciplinaCompleta.assuntos?.length > 0) {
          // Garantir que é um array e achatar
          const assuntosArray = ensureArray(disciplinaCompleta.assuntos);
          const flatAssuntos = assuntosArray.flat();
          if (flatAssuntos.length > 0) {
            // Filtrar valores vazios e formatar corretamente
            const validAssuntos = flatAssuntos.filter((a: string) => a && a.trim() !== '');
            if (validAssuntos.length > 0) {
              query = query.overlaps('assuntos', validAssuntos);
            }
          }
        }

        const { data: respostas, error } = await query;

        if (!error && respostas) {
          const totalAttempts = respostas.length;
          const correctAnswers = respostas.filter(r => r.is_correta).length;
          const wrongAnswers = totalAttempts - correctAnswers;

          // Adicionar log para verificar contagem de exercícios feitos, acertos e erros
          console.log(`[DISCIPLINA ${disciplina.id}] Exercícios feitos: ${totalAttempts}, Acertos: ${correctAnswers}, Erros: ${wrongAnswers}`);

          userStatsData[disciplina.id] = {
            totalAttempts,
            correctAnswers,
            wrongAnswers
          };
        } else if (error) {
          console.error(`Erro ao buscar respostas para disciplina ${disciplina.id}:`, error);
        }

        // Agora buscar estatísticas para cada tópico individualmente
        // Para isso, precisamos fazer uma query para cada combinação de filtros do tópico
        if (disciplinaCompleta.topicos_filtro?.length > 0) {
          // Verificar se topicos_filtro é um array válido
          if (!Array.isArray(disciplinaCompleta.topicos_filtro)) {
            console.error(`Estrutura inválida para topicos_filtro na disciplina ${disciplina.id}:`, disciplinaCompleta.topicos_filtro);
            continue;
          }
          
          for (let i = 0; i < disciplinaCompleta.topicos_filtro.length; i++) {
            // Construir query para este tópico específico
            let topicQuery = supabase
              .from('respostas_alunos')
              .select('is_correta')
              .eq('aluno_id', userId);

            // Aplicar os filtros da disciplina
            if (disciplinaCompleta.disciplinas_filtro?.length > 0) {
              const disciplinasArray = ensureArray(disciplinaCompleta.disciplinas_filtro);
              const flatDisciplinas = disciplinasArray.flat();
              if (flatDisciplinas.length > 0) {
                // Filtrar valores vazios e formatar corretamente
                const validDisciplinas = flatDisciplinas.filter((d: string) => d && d.trim() !== '');
                if (validDisciplinas.length > 0) {
                  topicQuery = topicQuery.in('disciplina', validDisciplinas);
                }
              }
            }

            if (disciplinaCompleta.bancas_filtro?.length > 0) {
              const bancasArray = ensureArray(disciplinaCompleta.bancas_filtro);
              const flatBancas = bancasArray.flat();
              if (flatBancas.length > 0) {
                // Filtrar valores vazios e formatar corretamente
                const validBancas = flatBancas.filter((b: string) => b && b.trim() !== '');
                if (validBancas.length > 0) {
                  topicQuery = topicQuery.in('banca', validBancas);
                }
              }
            }

            // Aplicar filtros específicos deste tópico
            const topicFilters = disciplinaCompleta.topicos_filtro[i];
            
            // Verificar se topicFilters é válido antes de processar
            if (topicFilters === null || topicFilters === undefined) {
              console.log(`Tópico ${i} da disciplina ${disciplina.id} não tem filtros definidos`);
              continue;
            }
            
            // Garantir que é um array antes de tentar filtrar
            const topicFiltersArray = ensureArray(topicFilters);
            if (topicFiltersArray.length > 0) {
              // Filtrar valores vazios e formatar corretamente
              const validTopicFilters = topicFiltersArray.filter((t: string) => t && t.trim() !== '');
              if (validTopicFilters.length > 0) {
                topicQuery = topicQuery.overlaps('topicos', validTopicFilters);
              }
            }

            // Aplicar filtros de assuntos se existirem
            if (disciplinaCompleta.assuntos?.length > 0) {
              const assuntosArray = ensureArray(disciplinaCompleta.assuntos);
              const flatAssuntos = assuntosArray.flat();
              if (flatAssuntos.length > 0) {
                // Filtrar valores vazios e formatar corretamente
                const validAssuntos = flatAssuntos.filter((a: string) => a && a.trim() !== '');
                if (validAssuntos.length > 0) {
                  topicQuery = topicQuery.overlaps('assuntos', validAssuntos);
                }
              }
            }

            const { data: topicRespostas, error: topicError } = await topicQuery;

            if (!topicError && topicRespostas) {
              const totalAttempts = topicRespostas.length;
              const correctAnswers = topicRespostas.filter(r => r.is_correta).length;
              const wrongAnswers = totalAttempts - correctAnswers;

              // Adicionar log para verificar contagem de exercícios feitos, acertos e erros por tópico
              console.log(`[DISCIPLINA ${disciplina.id} - TÓPICO ${i}] Exercícios feitos: ${totalAttempts}, Acertos: ${correctAnswers}, Erros: ${wrongAnswers}`);

              const topicKey = `${disciplina.id}-${i}`;
              topicStatsData[topicKey] = {
                totalAttempts,
                correctAnswers,
                wrongAnswers
              };
            } else if (topicError) {
              console.error(`Erro ao buscar respostas para tópico ${i} da disciplina ${disciplina.id}:`, topicError);
            }
          }
        }
      }

      setUserStats(userStatsData);
      setTopicUserStats(topicStatsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      setLoading(false);
    }
  };

  return {
    importanceStats,
    userStats,
    topicUserStats,
    loading
  };
};