// Script para aplicar a migração das colunas de filtros na tabela disciplinaverticalizada
const { exec } = require('child_process');
const path = require('path');

// Caminho para o CLI do Supabase
const supabaseCLI = process.platform === 'win32' ? 'npx supabase' : 'supabase';

// Função para executar comandos
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`Executando: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(`Saída: ${stdout}`);
      resolve(stdout);
    });
  });
};

// Função principal
async function main() {
  try {
    console.log('Iniciando aplicação das migrações...');
    
    // Aplicar a migração das colunas na tabela disciplinaverticalizada
    const migrationPath1 = path.join(__dirname, '..', 'supabase', 'supabase', 'migrations', '20250428000000_add_assuntos_topicos_to_disciplinaverticalizada.sql');
    await runCommand(`${supabaseCLI} migration up --file ${migrationPath1}`);
    
    // Aplicar a migração da coluna assuntos na tabela respostas_alunos
    const migrationPath2 = path.join(__dirname, '..', 'supabase', 'supabase', 'migrations', '20250428000001_add_assuntos_to_respostas_alunos.sql');
    await runCommand(`${supabaseCLI} migration up --file ${migrationPath2}`);
    
    // Aplicar a migração para corrigir formato de dados
    const migrationPath3 = path.join(__dirname, '..', 'supabase', 'supabase', 'migrations', '20250428000002_fix_array_data_format.sql');
    await runCommand(`${supabaseCLI} migration up --file ${migrationPath3}`);
    
    console.log('Migrações aplicadas com sucesso!');
  } catch (error) {
    console.error('Falha ao aplicar as migrações:', error);
    process.exit(1);
  }
}

// Executar a função principal
main();