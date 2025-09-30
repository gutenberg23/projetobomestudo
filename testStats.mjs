import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStats() {
  try {
    const userId = '7fcf658d-8f23-4ae9-9763-821294cd2500';
    
    // Buscar dados de filtros da disciplina de teste
    console.log('=== Buscando dados da disciplina de teste ===');
    const { data: disciplinas, error: disciplinasError } = await supabase
      .from('disciplinaverticalizada')
      .select('*')
      .eq('id', '5f21bac9-94e7-4dc1-83bc-518436108020') // ID da disciplina "ppt"
      .single();
    
    if (disciplinasError) {
      console.error('Erro ao buscar disciplina:', disciplinasError);
      return;
    }
    
    console.log('Disciplina encontrada:', disciplinas.titulo);
    console.log('  disciplinas_filtro:', disciplinas.disciplinas_filtro);
    console.log('  bancas_filtro:', disciplinas.bancas_filtro);
    console.log('  topicos_filtro:', disciplinas.topicos_filtro);
    console.log('  assuntos:', disciplinas.assuntos);
    
    // Testar consulta com os filtros da disciplina
    console.log('\n=== Testando consulta com filtros da disciplina ===');
    let query = supabase
      .from('respostas_alunos')
      .select('is_correta')
      .eq('aluno_id', userId);
    
    // Aplicar filtros
    if (disciplinas.disciplinas_filtro && disciplinas.disciplinas_filtro.length > 0) {
      query = query.in('disciplina', disciplinas.disciplinas_filtro);
    }
    
    if (disciplinas.bancas_filtro && disciplinas.bancas_filtro.length > 0) {
      query = query.in('banca', disciplinas.bancas_filtro);
    }
    
    if (disciplinas.topicos_filtro && disciplinas.topicos_filtro.length > 0) {
      query = query.overlaps('topicos', disciplinas.topicos_filtro);
    }
    
    if (disciplinas.assuntos && disciplinas.assuntos.length > 0) {
      query = query.overlaps('assuntos', disciplinas.assuntos);
    }
    
    const { data: respostas, error: respostasError } = await query;
    
    if (respostasError) {
      console.error('Erro ao buscar respostas:', respostasError);
      return;
    }
    
    console.log(`Respostas encontradas: ${respostas.length}`);
    
    const totalAttempts = respostas.length;
    const correctAnswers = respostas.filter(r => r.is_correta).length;
    const wrongAnswers = totalAttempts - correctAnswers;
    
    console.log(`Total de tentativas: ${totalAttempts}`);
    console.log(`Acertos: ${correctAnswers}`);
    console.log(`Erros: ${wrongAnswers}`);
    
    // Testar consulta específica para tópicos
    console.log('\n=== Testando consulta para tópicos específicos ===');
    if (disciplinas.topicos_filtro && disciplinas.topicos_filtro.length > 0) {
      for (let i = 0; i < disciplinas.topicos_filtro.length; i++) {
        const topicFilters = disciplinas.topicos_filtro[i];
        console.log(`Tópico ${i}:`, topicFilters);
        
        let topicQuery = supabase
          .from('respostas_alunos')
          .select('is_correta')
          .eq('aluno_id', userId);
        
        // Aplicar filtros da disciplina
        if (disciplinas.disciplinas_filtro && disciplinas.disciplinas_filtro.length > 0) {
          topicQuery = topicQuery.in('disciplina', disciplinas.disciplinas_filtro);
        }
        
        if (disciplinas.bancas_filtro && disciplinas.bancas_filtro.length > 0) {
          topicQuery = topicQuery.in('banca', disciplinas.bancas_filtro);
        }
        
        // Aplicar filtro específico do tópico
        if (topicFilters) {
          const topicFiltersArray = Array.isArray(topicFilters) ? topicFilters : [topicFilters];
          const validTopicFilters = topicFiltersArray.filter(t => t && t.trim() !== '');
          if (validTopicFilters.length > 0) {
            topicQuery = topicQuery.overlaps('topicos', validTopicFilters);
          }
        }
        
        if (disciplinas.assuntos && disciplinas.assuntos.length > 0) {
          topicQuery = topicQuery.overlaps('assuntos', disciplinas.assuntos);
        }
        
        const { data: topicRespostas, error: topicError } = await topicQuery;
        
        if (topicError) {
          console.error(`Erro ao buscar respostas para tópico ${i}:`, topicError);
        } else {
          const topicTotalAttempts = topicRespostas.length;
          const topicCorrectAnswers = topicRespostas.filter(r => r.is_correta).length;
          const topicWrongAnswers = topicTotalAttempts - topicCorrectAnswers;
          
          console.log(`  Respostas encontradas: ${topicTotalAttempts}`);
          console.log(`  Acertos: ${topicCorrectAnswers}`);
          console.log(`  Erros: ${topicWrongAnswers}`);
        }
      }
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testStats();