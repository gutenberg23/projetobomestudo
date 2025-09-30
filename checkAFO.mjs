import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAFO() {
  try {
    // Verificar todas as respostas de AFO
    const { data, error } = await supabase
      .from('respostas_alunos')
      .select('*')
      .eq('disciplina', 'Administração Financeira e Orçamentária - AFO');
    
    if (error) {
      console.error('Erro ao buscar respostas de AFO:', error);
      return;
    }
    
    console.log('Todas as respostas de AFO:', data.length);
    data.forEach((r, i) => {
      console.log(`  ${i+1}. Tópicos: ${JSON.stringify(r.topicos)}, Assuntos: ${JSON.stringify(r.assuntos)}`);
    });
    
    // Verificar os dados da disciplina AFO
    const { data: disciplinaData, error: disciplinaError } = await supabase
      .from('disciplinaverticalizada')
      .select('*')
      .eq('id', '51641c8b-b915-4e82-9893-f146e2e7aee7')
      .single();
    
    if (disciplinaError) {
      console.error('Erro ao buscar disciplina AFO:', disciplinaError);
      return;
    }
    
    console.log('\nDados da disciplina AFO:');
    console.log('  topicos_filtro:', JSON.stringify(disciplinaData.topicos_filtro));
    console.log('  assuntos:', JSON.stringify(disciplinaData.assuntos));
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkAFO();