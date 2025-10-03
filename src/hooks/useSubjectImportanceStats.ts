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
        console.log(`\n[DISCIPLINA: ${disciplina.titulo}]`);
        console.log(`ID: ${disciplina.id}`);
        
        // Inicializar acumuladores para o total da disciplina
        let totalDisciplinaAttempts = 0;
        let totalDisciplinaCorrect = 0;
        let totalDisciplinaWrong = 0;

        // Verificar se há tópicos para processar
        if (!disciplina.quantidade_questoes_filtro || disciplina.quantidade_questoes_filtro.length === 0) {
          console.log(`Disciplina ${disciplina.id} não tem tópicos para processar`);
          userStatsData[disciplina.id] = {
            totalAttempts: 0,
            correctAnswers: 0,
            wrongAnswers: 0
          };
          continue;
        }
        
      // Processar cada tópico individualmente
      for (let i = 0; i < disciplina.quantidade_questoes_filtro.length; i++) {
        // Obter os filtros para este tópico específico
        const topicoRaw = disciplina.topicos_filtro && disciplina.topicos_filtro[i] ? disciplina.topicos_filtro[i] : null;
        const assuntoRaw = disciplina.assuntos && disciplina.assuntos[i] ? disciplina.assuntos[i] : null;
        const disciplinaFiltroRaw = disciplina.disciplinas_filtro && disciplina.disciplinas_filtro[i] ? disciplina.disciplinas_filtro[i] : null;
        const bancaRaw = disciplina.bancas_filtro && disciplina.bancas_filtro[i] ? disciplina.bancas_filtro[i] : null;
        
        // Converter strings com pipe "|" em arrays (múltiplos valores por linha)
        const topicos = topicoRaw ? topicoRaw.split('|').map(t => t.trim()).filter(t => t) : [];
        const assuntos = assuntoRaw ? assuntoRaw.split('|').map(a => a.trim()).filter(a => a) : [];
        const disciplinas = disciplinaFiltroRaw ? disciplinaFiltroRaw.split('|').map(d => d.trim()).filter(d => d) : [];
        const bancas = bancaRaw ? bancaRaw.split('|').map(b => b.trim()).filter(b => b) : [];
        
        console.log(`\n[TÓPICO ${i + 1}]`);
        console.log(`  Filtros originais: disciplina="${disciplinaFiltroRaw}", banca="${bancaRaw}", assunto="${assuntoRaw}", topico="${topicoRaw}"`);
        console.log(`  Filtros processados: disciplinas=[${disciplinas.join(', ')}], bancas=[${bancas.join(', ')}], assuntos=[${assuntos.join(', ')}], topicos=[${topicos.join(', ')}]`);
        
        // Construir query base
        let query = supabase
          .from('respostas_alunos')
          .select('is_correta, questao_id, disciplina, banca, assuntos, topicos')
          .eq('aluno_id', userId);

        let hasFilters = false;
        const appliedFilters: string[] = [];

        // Aplicar filtros de disciplina (OR se múltiplos valores)
        if (disciplinas.length > 0) {
          if (disciplinas.length === 1) {
            query = query.eq('disciplina', disciplinas[0]);
            appliedFilters.push(`disciplina="${disciplinas[0]}"`);
          } else {
            query = query.in('disciplina', disciplinas);
            appliedFilters.push(`disciplina IN [${disciplinas.join(', ')}]`);
          }
          hasFilters = true;
        }

        // Aplicar filtros de banca (OR se múltiplos valores)
        if (bancas.length > 0) {
          if (bancas.length === 1) {
            query = query.eq('banca', bancas[0]);
            appliedFilters.push(`banca="${bancas[0]}"`);
          } else {
            query = query.in('banca', bancas);
            appliedFilters.push(`banca IN [${bancas.join(', ')}]`);
          }
          hasFilters = true;
        }

        // Aplicar filtros de assunto (OR se múltiplos valores)
        if (assuntos.length > 0) {
          // Usar overlaps para verificar se algum dos assuntos está presente
          query = query.overlaps('assuntos', assuntos);
          appliedFilters.push(`assuntos OVERLAPS [${assuntos.join(', ')}]`);
          hasFilters = true;
        }

        // Aplicar filtros de tópico (OR se múltiplos valores)
        if (topicos.length > 0) {
          // Usar overlaps para verificar se algum dos tópicos está presente
          query = query.overlaps('topicos', topicos);
          appliedFilters.push(`topicos OVERLAPS [${topicos.join(', ')}]`);
          hasFilters = true;
        }

        console.log(`  Filtros SQL aplicados: ${appliedFilters.join(' AND ')}`);

        // Se não houver nenhum filtro, não buscar nada para este tópico
        if (!hasFilters) {
          console.log(`  ⚠️ Nenhum filtro definido - contabilizando 0 questões`);
          const topicKey = `${disciplina.id}-${i}`;
          topicStatsData[topicKey] = {
            totalAttempts: 0,
            correctAnswers: 0,
            wrongAnswers: 0
          };
          continue;
        }

        // Executar query
        const { data: respostas, error } = await query;

        if (error) {
          console.error(`  ❌ Erro ao buscar respostas:`, error);
          const topicKey = `${disciplina.id}-${i}`;
          topicStatsData[topicKey] = {
            totalAttempts: 0,
            correctAnswers: 0,
            wrongAnswers: 0
          };
          continue;
        }

        // Log detalhado das respostas encontradas
        if (respostas && respostas.length > 0) {
          console.log(`  📊 ${respostas.length} questões encontradas:`);
          respostas.slice(0, 5).forEach((r: any, idx: number) => {
            console.log(`    ${idx + 1}. ID: ${r.questao_id}, Correta: ${r.is_correta}, Disciplina: ${r.disciplina}, Banca: ${r.banca}`);
            console.log(`       Assuntos: ${JSON.stringify(r.assuntos)}, Tópicos: ${JSON.stringify(r.topicos)}`);
          });
          if (respostas.length > 5) {
            console.log(`    ... e mais ${respostas.length - 5} questões`);
          }
        } else {
          console.log(`  📊 Nenhuma questão encontrada com esses filtros`);
        }

        // Calcular estatísticas
        const totalAttempts = respostas?.length || 0;
        const correctAnswers = respostas?.filter((r: UserAnswer) => r.is_correta).length || 0;
        const wrongAnswers = totalAttempts - correctAnswers;

        console.log(`  ✅ Resultado final: ${totalAttempts} questões | ${correctAnswers} acertos | ${wrongAnswers} erros`);

        // Armazenar estatísticas do tópico
        const topicKey = `${disciplina.id}-${i}`;
        topicStatsData[topicKey] = {
          totalAttempts,
          correctAnswers,
          wrongAnswers
        };

        // Acumular para o total da disciplina
        totalDisciplinaAttempts += totalAttempts;
        totalDisciplinaCorrect += correctAnswers;
        totalDisciplinaWrong += wrongAnswers;
      }
        
        // Armazenar estatísticas totais da disciplina
        userStatsData[disciplina.id] = {
          totalAttempts: totalDisciplinaAttempts,
          correctAnswers: totalDisciplinaCorrect,
          wrongAnswers: totalDisciplinaWrong
        };
        
        console.log(`\n[TOTAL DA DISCIPLINA]`);
        console.log(`  ${totalDisciplinaAttempts} questões | ${totalDisciplinaCorrect} acertos | ${totalDisciplinaWrong} erros`);
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