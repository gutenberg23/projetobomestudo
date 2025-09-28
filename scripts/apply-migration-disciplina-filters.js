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
    console.log('Iniciando aplicação da migração...');
    
    // Aplicar a migração específica
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250428000000_add_assuntos_topicos_to_disciplinaverticalizada.sql');
    await runCommand(`${supabaseCLI} migration up --file ${migrationPath}`);
    
    console.log('Migração aplicada com sucesso!');
  } catch (error) {
    console.error('Falha ao aplicar a migração:', error);
    process.exit(1);
  }
}

// Executar a função principal
main();