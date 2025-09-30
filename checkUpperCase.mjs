import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUpperCase() {
  try {
    // Verificar se há respostas com a banca em maiúsculas
    const { data, error } = await supabase
      .from('respostas_alunos')
      .select('*')
      .eq('banca', 'FGV - FUNDAÇÃO GETÚLIO VARGAS');
    
    if (error) {
      console.error('Erro ao buscar respostas:', error);
      return;
    }
    
    console.log('Respostas com banca em maiúsculas:', data.length);
    if (data.length > 0) {
      console.log('Detalhes das respostas:');
      data.forEach((r, index) => {
        console.log(`  ${index + 1}. Aluno: ${r.aluno_id}, Disciplina: "${r.disciplina}", Banca: "${r.banca}"`);
      });
    }
    
    // Verificar se há respostas com a banca em formato correto
    const { data: data2, error: error2 } = await supabase
      .from('respostas_alunos')
      .select('*')
      .eq('banca', 'FGV - Fundação Getúlio Vargas');
    
    if (error2) {
      console.error('Erro ao buscar respostas:', error2);
      return;
    }
    
    console.log('\nRespostas com banca em formato correto:', data2.length);
    if (data2.length > 0) {
      console.log('Detalhes das respostas:');
      data2.forEach((r, index) => {
        console.log(`  ${index + 1}. Aluno: ${r.aluno_id}, Disciplina: "${r.disciplina}", Banca: "${r.banca}"`);
      });
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkUpperCase();