import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAFOFilters() {
  try {
    // Coletar todos os assuntos e tópicos únicos das respostas de AFO
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas_alunos')
      .select('assuntos, topicos')
      .eq('disciplina', 'Administração Financeira e Orçamentária - AFO');
    
    if (respostasError) {
      console.error('Erro ao buscar respostas de AFO:', respostasError);
      return;
    }
    
    const allAssuntos = new Set();
    const allTopicos = new Set();
    
    respostas.forEach(r => {
      // Coletar assuntos
      if (r.assuntos && Array.isArray(r.assuntos)) {
        r.assuntos.forEach(assunto => allAssuntos.add(assunto));
      }
      
      // Coletar tópicos
      if (r.topicos && Array.isArray(r.topicos)) {
        r.topicos.forEach(topico => allTopicos.add(topico));
      }
    });
    
    console.log('Assuntos únicos encontrados:', Array.from(allAssuntos));
    console.log('Tópicos únicos encontrados:', Array.from(allTopicos));
    
    // Atualizar os filtros da disciplina AFO
    const { data, error } = await supabase
      .from('disciplinaverticalizada')
      .update({ 
        topicos_filtro: Array.from(allTopicos), 
        assuntos: Array.from(allAssuntos) 
      })
      .eq('id', '51641c8b-b915-4e82-9893-f146e2e7aee7');
    
    if (error) {
      console.error('Erro ao atualizar disciplina AFO:', error);
      return;
    }
    
    console.log('\nAtualização concluída com sucesso!');
    
    // Verificar os dados atualizados
    const { data: updatedData, error: fetchError } = await supabase
      .from('disciplinaverticalizada')
      .select('topicos_filtro, assuntos')
      .eq('id', '51641c8b-b915-4e82-9893-f146e2e7aee7')
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar dados atualizados:', fetchError);
      return;
    }
    
    console.log('Dados após atualização:');
    console.log('  topicos_filtro:', JSON.stringify(updatedData.topicos_filtro));
    console.log('  assuntos:', JSON.stringify(updatedData.assuntos));
    
    // Verificar quantas respostas seriam encontradas agora
    console.log('\nVerificando quantas respostas seriam encontradas com os novos filtros:');
    let encontradas = 0;
    respostas.forEach((r, i) => {
      const matchAssunto = updatedData.assuntos.some(assunto => r.assuntos.includes(assunto));
      const matchTopico = updatedData.topicos_filtro.some(topico => r.topicos.includes(topico));
      
      if (matchAssunto && matchTopico) {
        console.log(`  Resposta ${i+1}: ENCONTRADA`);
        encontradas++;
      } else {
        console.log(`  Resposta ${i+1}: NÃO ENCONTRADA`);
      }
    });
    
    console.log(`\nTotal de respostas que seriam encontradas: ${encontradas} de ${respostas.length}`);
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

updateAFOFilters();