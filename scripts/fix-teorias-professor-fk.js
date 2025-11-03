import { createClient } from '@supabase/supabase-js';

// Configuration - Replace with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixTeoriasProfessorFK() {
  console.log('Iniciando correção do relacionamento de professores nas teorias...');

  try {
    // 1. Buscar todas as teorias com professor_id preenchido
    const { data: teorias, error: teoriasError } = await supabase
      .from('teorias')
      .select('id, professor_id')
      .not('professor_id', 'is', null);

    if (teoriasError) {
      throw new Error(`Erro ao buscar teorias: ${teoriasError.message}`);
    }

    console.log(`Encontradas ${teorias.length} teorias com professor_id`);

    // 2. Buscar todos os professores com seus emails
    const { data: professores, error: professoresError } = await supabase
      .from('professores')
      .select('id, email');

    if (professoresError) {
      throw new Error(`Erro ao buscar professores: ${professoresError.message}`);
    }

    console.log(`Encontrados ${professores.length} professores`);

    // 3. Criar mapa de email -> user_id
    const professorEmailToUserIdMap = {};
    for (const professor of professores) {
      if (professor.email) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', professor.email)
          .single();

        if (!userError && userData) {
          professorEmailToUserIdMap[professor.id] = userData.id;
        }
      }
    }

    console.log(`Mapeados ${Object.keys(professorEmailToUserIdMap).length} professores para user_ids`);

    // 4. Atualizar as teorias com os user_ids corretos
    let updatedCount = 0;
    for (const teoria of teorias) {
      const correctUserId = professorEmailToUserIdMap[teoria.professor_id];
      
      if (correctUserId) {
        const { error: updateError } = await supabase
          .from('teorias')
          .update({ professor_id: correctUserId })
          .eq('id', teoria.id);

        if (updateError) {
          console.error(`Erro ao atualizar teoria ${teoria.id}:`, updateError.message);
        } else {
          updatedCount++;
          console.log(`Atualizada teoria ${teoria.id} - Professor ID: ${teoria.professor_id} -> ${correctUserId}`);
        }
      } else {
        console.log(`Não encontrado user_id para o professor ${teoria.professor_id} na teoria ${teoria.id}`);
      }
    }

    console.log(`Atualizadas ${updatedCount} teorias com user_ids corretos`);

    // 5. Verificar se todas as teorias agora têm user_ids válidos
    const { data: teoriasAtualizadas, error: verificacaoError } = await supabase
      .from('teorias')
      .select('id, professor_id')
      .not('professor_id', 'is', null);

    if (verificacaoError) {
      throw new Error(`Erro ao verificar teorias atualizadas: ${verificacaoError.message}`);
    }

    let validCount = 0;
    let invalidCount = 0;

    for (const teoria of teoriasAtualizadas) {
      // Verificar se o professor_id é um user_id válido
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', teoria.professor_id)
        .single();

      if (!userError && userData) {
        validCount++;
      } else {
        invalidCount++;
        console.log(`Teoria ${teoria.id} ainda tem professor_id inválido: ${teoria.professor_id}`);
      }
    }

    console.log(`Verificação final: ${validCount} teorias válidas, ${invalidCount} teorias inválidas`);

    console.log('Processo de correção concluído!');
    return true;
  } catch (error) {
    console.error('Erro durante a correção:', error.message);
    return false;
  }
}

// Executar a função
fixTeoriasProfessorFK()
  .then(success => {
    if (success) {
      console.log('Migração concluída com sucesso!');
      process.exit(0);
    } else {
      console.log('Falha na migração.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro durante a execução:', error);
    process.exit(1);
  });