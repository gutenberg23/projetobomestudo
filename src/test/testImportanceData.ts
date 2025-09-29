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
      .select('id, titulo, importancia')
      .limit(5);

    if (error) {
      console.error('Erro ao buscar dados:', error);
      return;
    }

    console.log('Dados das disciplinas:');
    data?.forEach(disciplina => {
      console.log(`ID: ${disciplina.id}`);
      console.log(`Título: ${disciplina.titulo}`);
      console.log(`Importância:`, disciplina.importancia);
      
      // Verificar se importancia é um array válido
      if (Array.isArray(disciplina.importancia)) {
        const total = disciplina.importancia.reduce((sum, value) => sum + (value || 0), 0);
        console.log(`Total de importância: ${total}`);
        
        disciplina.importancia.forEach((value, index) => {
          const percentage = total > 0 ? Math.round(((value || 0) / total) * 100) : 0;
          console.log(`  Tópico ${index}: ${value} (${percentage}%)`);
        });
      } else {
        console.log('  Dados de importância inválidos ou ausentes');
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar a função
testImportanceData();