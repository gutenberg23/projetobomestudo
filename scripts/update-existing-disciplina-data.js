// Script para atualizar dados existentes na tabela disciplinaverticalizada
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateExistingData() {
  try {
    console.log('Iniciando atualização de dados existentes...');
    
    // Buscar todos os registros da tabela disciplinaverticalizada
    const { data: disciplinas, error } = await supabase
      .from('disciplinaverticalizada')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Encontrados ${disciplinas.length} registros para atualizar`);
    
    // Atualizar cada registro para garantir que as novas colunas existam
    for (const disciplina of disciplinas) {
      console.log(`Atualizando disciplina ID: ${disciplina.id}`);
      
      const updateData = {
        assuntos: disciplina.assuntos || [],
        topicos_filtro: disciplina.topicos_filtro || [],
        disciplinas_filtro: disciplina.disciplinas_filtro || [],
        bancas_filtro: disciplina.bancas_filtro || [],
        quantidade_questoes_filtro: disciplina.quantidade_questoes_filtro || []
      };
      
      const { error: updateError } = await supabase
        .from('disciplinaverticalizada')
        .update(updateData)
        .eq('id', disciplina.id);
      
      if (updateError) {
        console.error(`Erro ao atualizar disciplina ${disciplina.id}:`, updateError);
      } else {
        console.log(`Disciplina ${disciplina.id} atualizada com sucesso`);
      }
    }
    
    console.log('Atualização concluída!');
  } catch (error) {
    console.error('Erro durante a atualização:', error);
    process.exit(1);
  }
}

// Executar a função principal
updateExistingData();