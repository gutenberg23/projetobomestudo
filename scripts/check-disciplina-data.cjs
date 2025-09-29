const { createClient } = require('@supabase/supabase-js');

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Por favor, defina as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDisciplinaData() {
  try {
    console.log('Verificando dados da tabela disciplinaverticalizada...');
    
    const { data, error } = await supabase
      .from('disciplinaverticalizada')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Erro ao buscar dados:', error);
      return;
    }

    console.log('Disciplinas encontradas:', data.length);
    
    data.forEach((disciplina, index) => {
      console.log(`\n=== DISCIPLINA ${index + 1} ===`);
      console.log('ID:', disciplina.id);
      console.log('Título:', disciplina.titulo);
      
      // Verificar a estrutura de topicos_filtro
      console.log('Topicos_filtro:', disciplina.topicos_filtro);
      console.log('Tipo de topicos_filtro:', typeof disciplina.topicos_filtro);
      console.log('Topicos_filtro é array:', Array.isArray(disciplina.topicos_filtro));
      
      if (Array.isArray(disciplina.topicos_filtro)) {
        disciplina.topicos_filtro.forEach((topico, i) => {
          console.log(`  Tópico ${i}:`, topico);
          console.log(`    Tipo:`, typeof topico);
          console.log(`    É array:`, Array.isArray(topico));
        });
      }
      
      // Verificar a estrutura de assuntos
      console.log('Assuntos:', disciplina.assuntos);
      console.log('Tipo de assuntos:', typeof disciplina.assuntos);
      console.log('Assuntos é array:', Array.isArray(disciplina.assuntos));
      
      if (Array.isArray(disciplina.assuntos)) {
        disciplina.assuntos.forEach((assunto, i) => {
          console.log(`  Assunto ${i}:`, assunto);
          console.log(`    Tipo:`, typeof assunto);
          console.log(`    É array:`, Array.isArray(assunto));
        });
      }
    });
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  }
}

checkDisciplinaData();