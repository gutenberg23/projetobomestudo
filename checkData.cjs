const { supabase } = require('./src/integrations/supabase/client');

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
      .limit(5);
    
    if (respostasError) {
      console.error('Erro ao buscar respostas:', respostasError);
    } else {
      console.log('Respostas encontradas:', respostas.length);
      respostas.forEach(r => {
        console.log(`Aluno ID: ${r.aluno_id}, Disciplina: ${r.disciplina}, Banca: ${r.banca}`);
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
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkData();