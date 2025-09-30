// Script para testar os dados de importância diretamente do Supabase
import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseKey = 'seu-anon-key-aqui'; // Substitua pela sua chave

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImportanceData() {
  try {
    // Buscar algumas disciplinas para verificar os dados
    const { data, error } = await supabase
      .from('disciplinaverticalizada')
      .select('id, titulo')
      .limit(5);

    if (error) {
      console.error('Erro ao buscar dados:', error);
      return;
    }

    console.log('Dados das disciplinas:');
    data?.forEach(disciplina => {
      console.log(`ID: ${disciplina.id}`);
      console.log(`Título: ${disciplina.titulo}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar a função
testImportanceData();