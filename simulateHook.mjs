import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função auxiliar para garantir que temos um array
const ensureArray = (value) => {
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

async function simulateHook() {
  try {
    const userId = '7fcf658d-8f23-4ae9-9763-821294cd2500';
    
    // Buscar todas as disciplinas
    console.log('=== Buscando todas as disciplinas ===');
    const { data: disciplinas, error } = await supabase
      .from('disciplinaverticalizada')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar disciplinas:', error);
      return;
    }
    
    console.log('Disciplinas encontradas:', disciplinas.length);
    
    // Para cada disciplina, calcular estatísticas
    for (const disciplina of disciplinas) {
      console.log(`\n=== Processando disciplina: ${disciplina.titulo} (${disciplina.id}) ===`);
      console.log(`Filtros - disciplinas: ${JSON.stringify(disciplina.disciplinas_filtro)}`);
      console.log(`Filtros - bancas: ${JSON.stringify(disciplina.bancas_filtro)}`);
      console.log(`Filtros - topicos: ${JSON.stringify(disciplina.topicos_filtro)}`);
      console.log(`Filtros - assuntos: ${JSON.stringify(disciplina.assuntos)}`);
      
      // Construir query para estatísticas gerais da disciplina
      let query = supabase
        .from('respostas_alunos')
        .select('is_correta')
        .eq('aluno_id', userId);
      
      let hasFilters = false;

      // Aplicar filtros
      if (disciplina.disciplinas_filtro && disciplina.disciplinas_filtro.length > 0) {
        const disciplinasArray = ensureArray(disciplina.disciplinas_filtro);
        const flatDisciplinas = disciplinasArray.flat();
        if (flatDisciplinas.length > 0) {
          const validDisciplinas = flatDisciplinas.filter((d) => d && d.trim() !== '');
          if (validDisciplinas.length > 0) {
            query = query.in('disciplina', validDisciplinas);
            hasFilters = true;
            console.log(`Aplicando filtro de disciplina: ${JSON.stringify(validDisciplinas)}`);
          }
        }
      }

      if (disciplina.bancas_filtro && disciplina.bancas_filtro.length > 0) {
        const bancasArray = ensureArray(disciplina.bancas_filtro);
        const flatBancas = bancasArray.flat();
        if (flatBancas.length > 0) {
          const validBancas = flatBancas.filter((b) => b && b.trim() !== '');
          if (validBancas.length > 0) {
            query = query.in('banca', validBancas);
            hasFilters = true;
            console.log(`Aplicando filtro de banca: ${JSON.stringify(validBancas)}`);
          }
        }
      }

      if (disciplina.topicos_filtro && disciplina.topicos_filtro.length > 0) {
        const topicosArray = ensureArray(disciplina.topicos_filtro);
        const flatTopicos = topicosArray.flat();
        if (flatTopicos.length > 0) {
          const validTopicos = flatTopicos.filter((t) => t && t.trim() !== '');
          if (validTopicos.length > 0) {
            query = query.overlaps('topicos', validTopicos);
            hasFilters = true;
            console.log(`Aplicando filtro de tópicos: ${JSON.stringify(validTopicos)}`);
          }
        }
      }

      if (disciplina.assuntos && disciplina.assuntos.length > 0) {
        const assuntosArray = ensureArray(disciplina.assuntos);
        const flatAssuntos = assuntosArray.flat();
        if (flatAssuntos.length > 0) {
          const validAssuntos = flatAssuntos.filter((a) => a && a.trim() !== '');
          if (validAssuntos.length > 0) {
            query = query.overlaps('assuntos', validAssuntos);
            hasFilters = true;
            console.log(`Aplicando filtro de assuntos: ${JSON.stringify(validAssuntos)}`);
          }
        }
      }

      // Se não houver filtros, buscar todas as respostas do usuário
      if (!hasFilters) {
        console.log(`Nenhum filtro aplicado, buscando todas as respostas do usuário`);
        query = supabase
          .from('respostas_alunos')
          .select('is_correta')
          .eq('aluno_id', userId);
      }

      const { data: respostas, error: respostasError } = await query;
      
      if (respostasError) {
        console.error(`Erro ao buscar respostas para disciplina ${disciplina.id}:`, respostasError);
      } else {
        const totalAttempts = respostas.length;
        const correctAnswers = respostas.filter((r) => r.is_correta).length;
        const wrongAnswers = totalAttempts - correctAnswers;

        console.log(`[DISCIPLINA ${disciplina.id}] Exercícios feitos: ${totalAttempts}, Acertos: ${correctAnswers}, Erros: ${wrongAnswers}`);
        
        // Calcular aproveitamento
        const aproveitamento = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
        console.log(`[DISCIPLINA ${disciplina.id}] Aproveitamento: ${aproveitamento}%`);
      }
      
      // Processar estatísticas para cada tópico individualmente
      if (disciplina.topicos_filtro && disciplina.topicos_filtro.length > 0) {
        console.log(`\nProcessando tópicos para disciplina ${disciplina.id}:`);
        
        for (let i = 0; i < disciplina.topicos_filtro.length; i++) {
          const topicFilters = disciplina.topicos_filtro[i];
          console.log(`  Tópico ${i}: ${JSON.stringify(topicFilters)}`);
          
          // Construir query para este tópico específico
          let topicQuery = supabase
            .from('respostas_alunos')
            .select('is_correta')
            .eq('aluno_id', userId);

          let topicHasFilters = false;

          // Aplicar os filtros da disciplina
          if (disciplina.disciplinas_filtro && disciplina.disciplinas_filtro.length > 0) {
            const disciplinasArray = ensureArray(disciplina.disciplinas_filtro);
            const flatDisciplinas = disciplinasArray.flat();
            if (flatDisciplinas.length > 0) {
              const validDisciplinas = flatDisciplinas.filter((d) => d && d.trim() !== '');
              if (validDisciplinas.length > 0) {
                topicQuery = topicQuery.in('disciplina', validDisciplinas);
                topicHasFilters = true;
              }
            }
          }

          if (disciplina.bancas_filtro && disciplina.bancas_filtro.length > 0) {
            const bancasArray = ensureArray(disciplina.bancas_filtro);
            const flatBancas = bancasArray.flat();
            if (flatBancas.length > 0) {
              const validBancas = flatBancas.filter((b) => b && b.trim() !== '');
              if (validBancas.length > 0) {
                topicQuery = topicQuery.in('banca', validBancas);
                topicHasFilters = true;
              }
            }
          }

          // Aplicar filtros específicos deste tópico
          if (topicFilters !== null && topicFilters !== undefined) {
            const topicFiltersArray = ensureArray(topicFilters);
            if (topicFiltersArray.length > 0) {
              const validTopicFilters = topicFiltersArray.filter((t) => t && t.trim() !== '');
              if (validTopicFilters.length > 0) {
                topicQuery = topicQuery.overlaps('topicos', validTopicFilters);
                topicHasFilters = true;
              }
            }
          }

          if (disciplina.assuntos && disciplina.assuntos.length > 0) {
            const assuntosArray = ensureArray(disciplina.assuntos);
            const flatAssuntos = assuntosArray.flat();
            if (flatAssuntos.length > 0) {
              const validAssuntos = flatAssuntos.filter((a) => a && a.trim() !== '');
              if (validAssuntos.length > 0) {
                topicQuery = topicQuery.overlaps('assuntos', validAssuntos);
                topicHasFilters = true;
              }
            }
          }

          // Se não houver filtros, buscar todas as respostas do usuário para este tópico
          if (!topicHasFilters) {
            console.log(`    Nenhum filtro aplicado para este tópico`);
            topicQuery = supabase
              .from('respostas_alunos')
              .select('is_correta')
              .eq('aluno_id', userId);
          }

          const { data: topicRespostas, error: topicError } = await topicQuery;
          
          if (topicError) {
            console.error(`    Erro ao buscar respostas para tópico ${i}:`, topicError);
          } else {
            const totalAttempts = topicRespostas.length;
            const correctAnswers = topicRespostas.filter((r) => r.is_correta).length;
            const wrongAnswers = totalAttempts - correctAnswers;

            console.log(`    [TÓPICO ${i}] Exercícios feitos: ${totalAttempts}, Acertos: ${correctAnswers}, Erros: ${wrongAnswers}`);
            
            // Calcular aproveitamento
            const aproveitamento = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
            console.log(`    [TÓPICO ${i}] Aproveitamento: ${aproveitamento}%`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

simulateHook();