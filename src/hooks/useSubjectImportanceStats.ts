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
      
      // Inicializar acumuladores para o total da disciplina
      let totalDisciplinaAttempts = 0;
      let totalDisciplinaCorrect = 0;
      let totalDisciplinaWrong = 0;

      // Agora buscar estatísticas para cada tópico individualmente
      // Para isso, aplicamos os filtros da disciplina + banca + tópico específico
      // Processar tópicos com base na quantidade de tópicos ou na quantidade de filtros
      
      // Sempre processar os tópicos se houver quantidade_questoes_filtro definido
      // Isso garante que mesmo sem filtros específicos, os tópicos sejam processados
      if (disciplina.quantidade_questoes_filtro && disciplina.quantidade_questoes_filtro.length > 0) {
        // Verificar se topicos_filtro é um array válido (se existir)
        if (disciplina.topicos_filtro && !Array.isArray(disciplina.topicos_filtro)) {
          console.error(`Estrutura inválida para topicos_filtro na disciplina ${disciplina.id}:`, disciplina.topicos_filtro);
          // Continuar processando com arrays vazios
        }
        
        for (let i = 0; i < disciplina.quantidade_questoes_filtro.length; i++) {
          // Obter filtros para este tópico específico (pode ser undefined/null se não houver)
          let topicFilters = null;
          let assuntoFilters = null;
          let disciplinaFilters = null;
          let bancaFilters = null;
          
          // Verificar se temos filtros específicos para este tópico
          if (disciplina.topicos_filtro && Array.isArray(disciplina.topicos_filtro)) {
            // Se topicos_filtro é um array bidimensional, pegar o subarray para este tópico
            if (disciplina.topicos_filtro.length > i && 
                (Array.isArray(disciplina.topicos_filtro[i]) || 
                 (typeof disciplina.topicos_filtro[i] === 'string' && disciplina.topicos_filtro[i] !== null))) {
              topicFilters = disciplina.topicos_filtro[i];
            } else if (disciplina.topicos_filtro.length > i) {
              // Se for um array unidimensional, usar o elemento específico
              topicFilters = disciplina.topicos_filtro[i];
            }
          }
          
          // Verificar se temos assuntos específicos para este tópico
          if (disciplina.assuntos && Array.isArray(disciplina.assuntos)) {
            // Se assuntos é um array bidimensional, pegar o subarray para este tópico
            if (disciplina.assuntos.length > i && 
                (Array.isArray(disciplina.assuntos[i]) || 
                 (typeof disciplina.assuntos[i] === 'string' && disciplina.assuntos[i] !== null))) {
              assuntoFilters = disciplina.assuntos[i];
            } else if (disciplina.assuntos.length > i) {
              // Se for um array unidimensional, usar o elemento específico
              assuntoFilters = disciplina.assuntos[i];
            }
          }
          
          // Verificar se temos disciplinas específicas para este tópico
          if (disciplina.disciplinas_filtro && Array.isArray(disciplina.disciplinas_filtro)) {
            // Se disciplinas_filtro é um array bidimensional, pegar o subarray para este tópico
            if (disciplina.disciplinas_filtro.length > i && 
                (Array.isArray(disciplina.disciplinas_filtro[i]) || 
                 (typeof disciplina.disciplinas_filtro[i] === 'string' && disciplina.disciplinas_filtro[i] !== null))) {
              disciplinaFilters = disciplina.disciplinas_filtro[i];
            } else if (disciplina.disciplinas_filtro.length > i) {
              // Se for um array unidimensional, usar o elemento específico
              disciplinaFilters = disciplina.disciplinas_filtro[i];
            }
          }
          
          // Verificar se temos bancas específicas para este tópico
          if (disciplina.bancas_filtro && Array.isArray(disciplina.bancas_filtro)) {
            // Se bancas_filtro é um array bidimensional, pegar o subarray para este tópico
            if (disciplina.bancas_filtro.length > i && 
                (Array.isArray(disciplina.bancas_filtro[i]) || 
                 (typeof disciplina.bancas_filtro[i] === 'string' && disciplina.bancas_filtro[i] !== null))) {
              bancaFilters = disciplina.bancas_filtro[i];
            } else if (disciplina.bancas_filtro.length > i) {
              // Se for um array unidimensional, usar o elemento específico
              bancaFilters = disciplina.bancas_filtro[i];
            }
          }
          
          console.log(`[DISCIPLINA ${disciplina.id} - TÓPICO ${i}] Filtros específicos - topicos: ${JSON.stringify(topicFilters)}, assuntos: ${JSON.stringify(assuntoFilters)}, disciplinas: ${JSON.stringify(disciplinaFilters)}, bancas: ${JSON.stringify(bancaFilters)}`);
          
          // Construir query para este tópico específico
          let topicQuery = supabase
            .from('respostas_alunos')
            .select('is_correta')
            .eq('aluno_id', userId);

          let topicHasFilters = false;

          // Aplicar os filtros da disciplina (se não houver filtros específicos para este tópico)
          if (!disciplinaFilters && disciplina.disciplinas_filtro && disciplina.disciplinas_filtro.length > 0) {
            const disciplinasArray = ensureArray(disciplina.disciplinas_filtro);
            const flatDisciplinas = disciplinasArray.flat();
            if (flatDisciplinas.length > 0) {
              const validDisciplinas = flatDisciplinas.filter((d: string) => d && d.trim() !== '');
              if (validDisciplinas.length > 0) {
                topicQuery = topicQuery.in('disciplina', validDisciplinas);
                topicHasFilters = true;
              }
            }
          } else if (disciplinaFilters) {
            // Aplicar filtros específicos deste tópico
            const disciplinasArray = ensureArray(disciplinaFilters);
            if (disciplinasArray.length > 0) {
              const validDisciplinas = disciplinasArray.filter((d: string) => d && d.trim() !== '');
              if (validDisciplinas.length > 0) {
                topicQuery = topicQuery.in('disciplina', validDisciplinas);
                topicHasFilters = true;
              }
            }
          }

          // Aplicar filtros de banca (se não houver filtros específicos para este tópico)
          if (!bancaFilters && disciplina.bancas_filtro && disciplina.bancas_filtro.length > 0) {
            const bancasArray = ensureArray(disciplina.bancas_filtro);
            const flatBancas = bancasArray.flat();
            if (flatBancas.length > 0) {
              const validBancas = flatBancas.filter((b: string) => b && b.trim() !== '');
              if (validBancas.length > 0) {
                topicQuery = topicQuery.in('banca', validBancas);
                topicHasFilters = true;
              }
            }
          } else if (bancaFilters) {
            // Aplicar filtros específicos deste tópico
            const bancasArray = ensureArray(bancaFilters);
            if (bancasArray.length > 0) {
              const validBancas = bancasArray.filter((b: string) => b && b.trim() !== '');
              if (validBancas.length > 0) {
                topicQuery = topicQuery.in('banca', validBancas);
                topicHasFilters = true;
              }
            }
          }

          // Aplicar filtro específico de tópicos (se houver)
          if (topicFilters !== null && topicFilters !== undefined) {
            const topicFiltersArray = ensureArray(topicFilters);
            if (topicFiltersArray.length > 0) {
              const validTopicFilters = topicFiltersArray.filter((t: string) => t && t.trim() !== '');
              if (validTopicFilters.length > 0) {
                topicQuery = topicQuery.overlaps('topicos', validTopicFilters);
                topicHasFilters = true;
              }
            }
          }

          // Aplicar filtros de assuntos (se não houver filtros específicos para este tópico)
          if (!assuntoFilters && disciplina.assuntos && disciplina.assuntos.length > 0) {
            const assuntosArray = ensureArray(disciplina.assuntos);
            const flatAssuntos = assuntosArray.flat();
            if (flatAssuntos.length > 0) {
              const validAssuntos = flatAssuntos.filter((a: string) => a && a.trim() !== '');
              if (validAssuntos.length > 0) {
                topicQuery = topicQuery.overlaps('assuntos', validAssuntos);
                topicHasFilters = true;
              }
            }
          } else if (assuntoFilters) {
            // Aplicar filtros específicos deste tópico
            const assuntosArray = ensureArray(assuntoFilters);
            if (assuntosArray.length > 0) {
              const validAssuntos = assuntosArray.filter((a: string) => a && a.trim() !== '');
              if (validAssuntos.length > 0) {
                topicQuery = topicQuery.overlaps('assuntos', validAssuntos);
                topicHasFilters = true;
              }
            }
          }

          console.log(`[DISCIPLINA ${disciplina.id} - TÓPICO ${i}] filtros aplicados: 'disciplina' = ${disciplinaFilters ? ensureArray(disciplinaFilters).length : (disciplina.disciplinas_filtro?.length || 0)}, 'assuntos' = ${assuntoFilters ? ensureArray(assuntoFilters).length : (disciplina.assuntos?.length || 0)}, 'topicos' = ${topicFilters ? ensureArray(topicFilters).length : 0}, 'banca' = ${bancaFilters ? ensureArray(bancaFilters).length : (disciplina.bancas_filtro?.length || 0)}`);

          // Se não houver filtros, buscar todas as respostas do usuário para este tópico
          if (!topicHasFilters) {
            console.log(`[DISCIPLINA ${disciplina.id} - TÓPICO ${i}] Nenhum filtro aplicado, buscando todas as respostas do usuário`);
            topicQuery = supabase
              .from('respostas_alunos')
              .select('is_correta')
              .eq('aluno_id', userId);
          }

          const { data: topicRespostas, error: topicError } = await topicQuery;
          console.log(`Query executada para disciplina ${disciplina.id} tópico ${i}: ${topicRespostas?.length || 0} resultados`);

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
            
            // Acumular estatísticas para o total da disciplina
            totalDisciplinaAttempts += totalAttempts;
            totalDisciplinaCorrect += correctAnswers;
            totalDisciplinaWrong += wrongAnswers;
          } else if (topicError) {
            console.error(`Erro ao buscar respostas para tópico ${i} da disciplina ${disciplina.id}:`, topicError);
          }
        }
      }
      
      // Definir as estatísticas gerais da disciplina como a soma dos tópicos
      userStatsData[disciplina.id] = {
        totalAttempts: totalDisciplinaAttempts,
        correctAnswers: totalDisciplinaCorrect,
        wrongAnswers: totalDisciplinaWrong
      };
      
      console.log(`[DISCIPLINA ${disciplina.id}] Total acumulado: Exercícios feitos: ${totalDisciplinaAttempts}, Acertos: ${totalDisciplinaCorrect}, Erros: ${totalDisciplinaWrong}`);
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