import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  try {
    // Verificar dados da tabela disciplinaverticalizada
    console.log('=== Dados da tabela disciplinaverticalizada ===');
    const { data: disciplinas, error: disciplinasError } = await supabase
      .from('disciplinaverticalizada')
      .select('*')
      .limit(5);
    
    if (disciplinasError) {
      console.error('Erro ao buscar disciplinas:', disciplinasError);
    } else {
      console.log('Disciplinas encontradas:', disciplinas.length);
      disciplinas.forEach(d => {
        console.log(`ID: ${d.id}, Titulo: ${d.titulo}`);
        console.log(`  disciplinas_filtro: ${JSON.stringify(d.disciplinas_filtro)}`);
        console.log(`  bancas_filtro: ${JSON.stringify(d.bancas_filtro)}`);
        console.log(`  topicos_filtro: ${JSON.stringify(d.topicos_filtro)}`);
        console.log(`  assuntos: ${JSON.stringify(d.assuntos)}`);
        console.log('---');
      });
    }
    
    // Verificar dados da tabela respostas_alunos
    console.log('\n=== Dados da tabela respostas_alunos ===');
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas_alunos')
      .select('*')
      .limit(10);
    
    if (respostasError) {
      console.error('Erro ao buscar respostas:', respostasError);
    } else {
      console.log('Respostas encontradas:', respostas.length);
      respostas.forEach(r => {
        console.log(`Aluno ID: ${r.aluno_id}, Disciplina: "${r.disciplina}", Banca: "${r.banca}"`);
        console.log(`  Topicos: ${JSON.stringify(r.topicos)}`);
        console.log(`  Assuntos: ${JSON.stringify(r.assuntos)}`);
        console.log(`  Correta: ${r.is_correta}`);
        console.log('---');
      });
    }
    
    // Verificar se há respostas para um aluno específico
    if (disciplinas && disciplinas.length > 0 && respostas && respostas.length > 0) {
      const alunoId = respostas[0].aluno_id;
      console.log(`\n=== Respostas do aluno ${alunoId} ===`);
      
      const { data: respostasAluno, error: respostasAlunoError } = await supabase
        .from('respostas_alunos')
        .select('*')
        .eq('aluno_id', alunoId)
        .limit(10);
      
      if (respostasAlunoError) {
        console.error('Erro ao buscar respostas do aluno:', respostasAlunoError);
      } else {
        console.log(`Respostas do aluno ${alunoId}:`, respostasAluno.length);
        respostasAluno.forEach(r => {
          console.log(`  Disciplina: "${r.disciplina}", Banca: "${r.banca}"`);
        });
      }
    }
    
    // Testar uma consulta específica para verificar se os filtros estão funcionando
    if (disciplinas && disciplinas.length > 0) {
      const disciplinaTeste = disciplinas[0];
      console.log(`\n=== Testando filtros para disciplina: ${disciplinaTeste.titulo} ===`);
      
      // Verificar se temos filtros para testar
      if (disciplinaTeste.disciplinas_filtro && disciplinaTeste.disciplinas_filtro.length > 0) {
        const disciplinaFiltro = disciplinaTeste.disciplinas_filtro[0];
        console.log(`Filtro de disciplina: "${disciplinaFiltro}"`);
        
        // Testar consulta com filtro de disciplina
        const { data: respostasFiltradas, error: filtroError } = await supabase
          .from('respostas_alunos')
          .select('disciplina, banca, is_correta')
          .eq('disciplina', disciplinaFiltro)
          .limit(5);
          
        if (filtroError) {
          console.error('Erro ao filtrar por disciplina:', filtroError);
        } else {
          console.log(`Respostas encontradas com filtro de disciplina: ${respostasFiltradas.length}`);
          respostasFiltradas.forEach(r => {
            console.log(`  Disciplina: "${r.disciplina}", Banca: "${r.banca}", Correta: ${r.is_correta}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkData();