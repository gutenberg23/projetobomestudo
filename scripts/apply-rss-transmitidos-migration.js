// Script para aplicar a migração da tabela rss_transmitidos
import { readFileSync } from 'fs';
import { join } from 'path';

// Caminho para o arquivo SQL de migração
const migrationPath = join(process.cwd(), 'scripts', 'create_rss_transmitidos_table.sql');

// Verificar se o arquivo existe
try {
  const migrationContent = readFileSync(migrationPath, 'utf8');
  console.log('Arquivo de migração encontrado:', migrationPath);
  console.log('Para aplicar a migração, execute o seguinte SQL no seu banco de dados Supabase:');
  console.log('\n--- INÍCIO DO SQL ---\n');
  console.log(migrationContent);
  console.log('\n--- FIM DO SQL ---\n');
  console.log('Instruções:');
  console.log('1. Acesse o painel do Supabase');
  console.log('2. Vá para a seção "SQL Editor"');
  console.log('3. Cole o SQL acima e execute');
  console.log('4. A tabela rss_transmitidos será criada com todos os índices necessários');
} catch (error) {
  console.error('Arquivo de migração não encontrado:', migrationPath);
  console.error('Erro:', error.message);
  process.exit(1);
}