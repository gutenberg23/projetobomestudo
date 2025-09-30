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

interface DisciplinaFilters {
  id: string;
  titulo: string;
  quantidade_questoes_filtro: number[] | null;
  disciplinas_filtro: string[] | null;
  topicos_filtro: string[] | null;
  bancas_filtro: string[] | null;
  assuntos: string[] | null;
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
          setLoading(false);
          return;
        }
        
        // Buscar todas as colunas necessárias da tabela disciplinaverticalizada
        const { data: disciplinas, error } = await supabase
          .from('disciplinaverticalizada')
          .select(`
            id, 
            titulo, 
            quantidade_questoes_filtro,
            disciplinas_filtro,
            topicos_filtro,
            bancas_filtro,
            assuntos
          `)
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
          setImportanceStats(importanceData);
          
          // Se houver usuário logado, buscar estatísticas de respostas
          if (currentUserId) {
            await fetchUserAnswerStats(disciplinas || [], currentUserId);
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
    
    // Se já for um array, retornar diretamente
    if (Array.isArray(value)) {
      return value;
    }
    
    // Se for uma string, tentar parsear como JSON
    if (typeof value === 'string') {
      // Remover possíveis caracteres de escape ou formatação
      const cleanValue = value.trim();
      
      // Se for uma string vazia, retornar array vazio
      if (cleanValue === '') {
        return [];
      }
      
      try {
        // Tentar parsear como JSON array
        const parsed = JSON.parse(cleanValue);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        // Se o resultado não for um array mas for um valor válido, retornar como array
        if (parsed !== null && parsed !== undefined) {
          return [parsed];
        }
      } catch (e) {
        // Se não conseguir parsear como JSON, retornar como array com o valor
        return [cleanValue];
      }
    }
    
    // Para outros tipos, converter para string e retornar como array
    return [String(value)];
  };

  interface UserAnswer {
    is_correta: boolean;
  }

  const fetchUserAnswerStats = async (disciplinas: DisciplinaFilters[], userId: string) => {
    try {
      const userStatsData: Record<string, UserAnswerStats> = {};
      const topicStatsData: Record<string, UserAnswerStats> = {};
            
      // Verificar se há disciplinas para processar
      if (!disciplinas || disciplinas.length === 0) {
        setUserStats(userStatsData);
        setTopicUserStats(topicStatsData);
        return;
      }

      // Para cada disciplina, buscar dados dos filtros e calcular estatísticas
      for (const disciplina of disciplinas) {
        console.log(`linha 1 da tabela '${disciplina.titulo}'`);
        console.log(`(disciplinaverticalizada) -> filtros a buscar: 'disciplinas_filtro' = ${JSON.stringify(disciplina.disciplinas_filtro)}, 'assuntos' = ${JSON.stringify(disciplina.assuntos)}, 'topicos_filtro' = ${JSON.stringify(disciplina.topicos_filtro)}, 'bancas_filtro' = ${JSON.stringify(disciplina.bancas_filtro)}`);
        
        // Usar sempre a abordagem padrão com tratamento de case sensitivity
        let query = supabase
          .from('respostas_alunos')
          .select('is_correta')
          .eq('aluno_id', userId);
        
        let hasFilters = false;
        let filterCounts = { disciplina: 0, assuntos: 0, topicos: 0, banca: 0 };

        // Para disciplina (TEXT na respostas_alunos, ARRAY na disciplinaverticalizada)
        if (disciplina.disciplinas_filtro && disciplina.disciplinas_filtro.length > 0) {
          const disciplinasArray = ensureArray(disciplina.disciplinas_filtro);
          const flatDisciplinas = disciplinasArray.flat();
          if (flatDisciplinas.length > 0) {
            const validDisciplinas = flatDisciplinas.filter((d: string) => d && d.trim() !== '');
            if (validDisciplinas.length > 0) {
              // Para TEXT vs ARRAY, usamos 'in' no lado do banco de dados
              query = query.in('disciplina', validDisciplinas);
              filterCounts.disciplina = validDisciplinas.length;
              hasFilters = true;
              console.log(`Aplicando filtro de disciplina: ${JSON.stringify(validDisciplinas)}`);
            }
          }
        }

        // Para banca (TEXT na respostas_alunos, ARRAY na disciplinaverticalizada)
        if (disciplina.bancas_filtro && disciplina.bancas_filtro.length > 0) {
          const bancasArray = ensureArray(disciplina.bancas_filtro);
          const flatBancas = bancasArray.flat();
          if (flatBancas.length > 0) {
            const validBancas = flatBancas.filter((b: string) => b && b.trim() !== '');
            if (validBancas.length > 0) {
              // Para TEXT vs ARRAY, usamos 'in' no lado do banco de dados
              query = query.in('banca', validBancas);
              filterCounts.banca = validBancas.length;
              hasFilters = true;
              console.log(`Aplicando filtro de banca: ${JSON.stringify(validBancas)}`);
            }
          }
        }

        // Para topicos (ARRAY em ambos, usar overlaps)
        if (disciplina.topicos_filtro && disciplina.topicos_filtro.length > 0) {
          const topicosArray = ensureArray(disciplina.topicos_filtro);
          const flatTopicos = topicosArray.flat();
          if (flatTopicos.length > 0) {
            const validTopicos = flatTopicos.filter((t: string) => t && t.trim() !== '');
            if (validTopicos.length > 0) {
              query = query.overlaps('topicos', validTopicos);
              filterCounts.topicos = validTopicos.length;
              hasFilters = true;
            }
          }
        }

        // Para assuntos (ARRAY em ambos, usar overlaps)
        if (disciplina.assuntos && disciplina.assuntos.length > 0) {
          const assuntosArray = ensureArray(disciplina.assuntos);
          const flatAssuntos = assuntosArray.flat();
          if (flatAssuntos.length > 0) {
            const validAssuntos = flatAssuntos.filter((a: string) => a && a.trim() !== '');
            if (validAssuntos.length > 0) {
              query = query.overlaps('assuntos', validAssuntos);
              filterCounts.assuntos = validAssuntos.length;
              hasFilters = true;
            }
          }
        }

        console.log(`(respostas_alunos) -> quantidade de filtros encontrados: 'disciplina' = ${filterCounts.disciplina}, 'assuntos' = ${filterCounts.assuntos}, 'topicos' = ${filterCounts.topicos}, 'banca' = ${filterCounts.banca}`);

        // Se não houver filtros, buscar todas as respostas do usuário
        if (!hasFilters) {
          console.log(`Nenhum filtro aplicado para disciplina ${disciplina.id}, buscando todas as respostas do usuário`);
          query = supabase
            .from('respostas_alunos')
            .select('is_correta')
            .eq('aluno_id', userId);
        }

        const { data: respostas, error } = await query;
        console.log(`Query executada para disciplina ${disciplina.id}:`, respostas?.length || 0, 'resultados');

        if (!error && respostas) {
          const totalAttempts = respostas.length;
          const correctAnswers = respostas.filter((r: UserAnswer) => r.is_correta).length;
          const wrongAnswers = totalAttempts - correctAnswers;

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
        if (disciplina.topicos_filtro && disciplina.topicos_filtro.length > 0) {
          // Verificar se topicos_filtro é um array válido
          if (!Array.isArray(disciplina.topicos_filtro)) {
            console.error(`Estrutura inválida para topicos_filtro na disciplina ${disciplina.id}:`, disciplina.topicos_filtro);
            continue;
          }
          
          for (let i = 0; i < disciplina.topicos_filtro.length; i++) {
            // Construir query para este tópico específico
            let topicQuery = supabase
              .from('respostas_alunos')
              .select('is_correta')
              .eq('aluno_id', userId);

            let topicHasFilters = false;
            let topicFilterCounts = { disciplina: 0, assuntos: 0, topicos: 0, banca: 0 };

            // Aplicar os filtros da disciplina
            // Para disciplina (TEXT na respostas_alunos, ARRAY na disciplinaverticalizada)
            if (disciplina.disciplinas_filtro && disciplina.disciplinas_filtro.length > 0) {
              const disciplinasArray = ensureArray(disciplina.disciplinas_filtro);
              const flatDisciplinas = disciplinasArray.flat();
              if (flatDisciplinas.length > 0) {
                const validDisciplinas = flatDisciplinas.filter((d: string) => d && d.trim() !== '');
                if (validDisciplinas.length > 0) {
                  // Para TEXT vs ARRAY, usamos 'in' no lado do banco de dados
                  topicQuery = topicQuery.in('disciplina', validDisciplinas);
                  topicFilterCounts.disciplina = validDisciplinas.length;
                  topicHasFilters = true;
                }
              }
            }

            // Para banca (TEXT na respostas_alunos, ARRAY na disciplinaverticalizada)
            if (disciplina.bancas_filtro && disciplina.bancas_filtro.length > 0) {
              const bancasArray = ensureArray(disciplina.bancas_filtro);
              const flatBancas = bancasArray.flat();
              if (flatBancas.length > 0) {
                const validBancas = flatBancas.filter((b: string) => b && b.trim() !== '');
                if (validBancas.length > 0) {
                  // Para TEXT vs ARRAY, usamos 'in' no lado do banco de dados
                  topicQuery = topicQuery.in('banca', validBancas);
                  topicFilterCounts.banca = validBancas.length;
                  topicHasFilters = true;
                }
              }
            }

            // Aplicar filtros específicos deste tópico (ARRAY em ambos, usar overlaps)
            const topicFilters = disciplina.topicos_filtro[i];
          
            // Verificar se topicFilters é válido antes de processar
            if (topicFilters === null || topicFilters === undefined) {
              continue;
            }
          
            // Garantir que é um array antes de tentar filtrar
            const topicFiltersArray = ensureArray(topicFilters);
            if (topicFiltersArray.length > 0) {
              const validTopicFilters = topicFiltersArray.filter((t: string) => t && t.trim() !== '');
              if (validTopicFilters.length > 0) {
                topicQuery = topicQuery.overlaps('topicos', validTopicFilters);
                topicFilterCounts.topicos = validTopicFilters.length;
                topicHasFilters = true;
              }
            }

            // Aplicar filtros de assuntos (ARRAY em ambos, usar overlaps)
            if (disciplina.assuntos && disciplina.assuntos.length > 0) {
              const assuntosArray = ensureArray(disciplina.assuntos);
              const flatAssuntos = assuntosArray.flat();
              if (flatAssuntos.length > 0) {
                const validAssuntos = flatAssuntos.filter((a: string) => a && a.trim() !== '');
                if (validAssuntos.length > 0) {
                  topicQuery = topicQuery.overlaps('assuntos', validAssuntos);
                  topicFilterCounts.assuntos = validAssuntos.length;
                  topicHasFilters = true;
                }
              }
            }

            console.log(`[DISCIPLINA ${disciplina.id} - TÓPICO ${i}] filtros aplicados: 'disciplina' = ${topicFilterCounts.disciplina}, 'assuntos' = ${topicFilterCounts.assuntos}, 'topicos' = ${topicFilterCounts.topicos}, 'banca' = ${topicFilterCounts.banca}`);

            // Se não houver filtros, buscar todas as respostas do usuário para este tópico
            if (!topicHasFilters) {
              console.log(`[DISCIPLINA ${disciplina.id} - TÓPICO ${i}] Nenhum filtro aplicado, buscando todas as respostas do usuário`);
            }

            const { data: topicRespostas, error: topicError } = await topicQuery;
            console.log(`Query executada para disciplina ${disciplina.id} tópico ${i}:`, topicRespostas?.length || 0, 'resultados');

            if (!topicError && topicRespostas) {
              const totalAttempts = topicRespostas.length;
              const correctAnswers = topicRespostas.filter((r: UserAnswer) => r.is_correta).length;
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