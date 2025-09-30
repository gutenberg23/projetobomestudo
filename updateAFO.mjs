import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAFO() {
  try {
    // Atualizar os filtros da disciplina AFO
    const { data, error } = await supabase
      .from('disciplinaverticalizada')
      .update({ 
        topicos_filtro: ['Orçamentos Tradicional ou Clássico'], 
        assuntos: ['2. Conceitos do Orçamento Público'] 
      })
      .eq('id', '51641c8b-b915-4e82-9893-f146e2e7aee7');
    
    if (error) {
      console.error('Erro ao atualizar disciplina AFO:', error);
      return;
    }
    
    console.log('Atualização concluída com sucesso!');
    console.log('Dados atualizados:', data);
    
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
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

updateAFO();