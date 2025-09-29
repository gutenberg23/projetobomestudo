// Script para debugar dados das disciplinas
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase - usando valores fixos para debug
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjQ0MzUsImV4cCI6MjA1OTEwMDQzNX0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDisciplinaData() {
  try {
    console.log('Iniciando debug de dados das disciplinas...');
    
    // Buscar disciplinas específicas
    const { data: disciplinas, error } = await supabase
      .from('disciplinaverticalizada')
      .select('*')
      .in('id', ['fb0db3d7-e720-4378-ab95-567e3a07ec43', '4ce917b9-9ec7-4f5b-8569-9ed4ae4b918c']);
    
    if (error) {
      throw error;
    }
    
    console.log('Disciplinas encontradas:', disciplinas.length);
    
    disciplinas.forEach(disciplina => {
      console.log('\n=== DISCIPLINA ===');
      console.log('ID:', disciplina.id);
      console.log('Título:', disciplina.titulo);
      console.log('Assuntos:', disciplina.assuntos);
      console.log('Tópicos Filtro:', disciplina.topicos_filtro);
      console.log('Disciplinas Filtro:', disciplina.disciplinas_filtro);
      console.log('Bancas Filtro:', disciplina.bancas_filtro);
      
      // Verificar formato dos arrays
      if (disciplina.assuntos) {
        console.log('Tipo de assuntos:', typeof disciplina.assuntos);
        console.log('Assuntos é array:', Array.isArray(disciplina.assuntos));
        if (Array.isArray(disciplina.assuntos)) {
          console.log('Conteúdo dos assuntos:', disciplina.assuntos.map(a => typeof a));
        }
      }
      
      if (disciplina.topicos_filtro) {
        console.log('Tipo de topicos_filtro:', typeof disciplina.topicos_filtro);
        console.log('Topicos_filtro é array:', Array.isArray(disciplina.topicos_filtro));
        if (Array.isArray(disciplina.topicos_filtro)) {
          console.log('Conteúdo dos topicos_filtro:', disciplina.topicos_filtro.map(t => typeof t));
        }
      }
    });
    
    // Testar uma consulta de exemplo
    console.log('\n=== TESTANDO CONSULTA ===');
    const testQuery = supabase
      .from('respostas_alunos')
      .select('is_correta')
      .eq('aluno_id', '7fcf658d-8f23-4ae9-9763-821294cd2500')
      .overlaps('assuntos', ['Interpretação de Texto']);
    
    console.log('Query SQL gerada:', testQuery.toSql());
    
  } catch (error) {
    console.error('Erro durante o debug:', error);
    process.exit(1);
  }
}

// Executar a função principal
debugDisciplinaData();