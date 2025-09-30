import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function collectAFOData() {
  try {
    // Verificar todas as respostas de AFO
    const { data, error } = await supabase
      .from('respostas_alunos')
      .select('assuntos, topicos')
      .eq('disciplina', 'Administração Financeira e Orçamentária - AFO');
    
    if (error) {
      console.error('Erro ao buscar respostas de AFO:', error);
      return;
    }
    
    console.log('Todas as respostas de AFO:');
    const allAssuntos = new Set();
    const allTopicos = new Set();
    
    data.forEach((r, i) => {
      console.log(`  ${i+1}. Tópicos: ${JSON.stringify(r.topicos)}, Assuntos: ${JSON.stringify(r.assuntos)}`);
      
      // Coletar assuntos
      if (r.assuntos && Array.isArray(r.assuntos)) {
        r.assuntos.forEach(assunto => allAssuntos.add(assunto));
      }
      
      // Coletar tópicos
      if (r.topicos && Array.isArray(r.topicos)) {
        r.topicos.forEach(topico => allTopicos.add(topico));
      }
    });
    
    console.log('\nAssuntos únicos encontrados:', Array.from(allAssuntos));
    console.log('Tópicos únicos encontrados:', Array.from(allTopicos));
    
    // Verificar os filtros atuais da disciplina AFO
    const { data: disciplinaData, error: disciplinaError } = await supabase
      .from('disciplinaverticalizada')
      .select('assuntos, topicos_filtro')
      .eq('id', '51641c8b-b915-4e82-9893-f146e2e7aee7')
      .single();
    
    if (disciplinaError) {
      console.error('Erro ao buscar disciplina AFO:', disciplinaError);
      return;
    }
    
    console.log('\nFiltros atuais da disciplina AFO:');
    console.log('  assuntos:', JSON.stringify(disciplinaData.assuntos));
    console.log('  topicos_filtro:', JSON.stringify(disciplinaData.topicos_filtro));
    
    // Verificar quais respostas seriam encontradas com os filtros atuais
    console.log('\nVerificando quais respostas seriam encontradas com os filtros atuais:');
    let encontradas = 0;
    data.forEach((r, i) => {
      const matchAssunto = disciplinaData.assuntos.some(assunto => r.assuntos.includes(assunto));
      const matchTopico = disciplinaData.topicos_filtro.some(topico => r.topicos.includes(topico));
      
      if (matchAssunto && matchTopico) {
        console.log(`  Resposta ${i+1}: ENCONTRADA (assunto: ${matchAssunto}, tópico: ${matchTopico})`);
        encontradas++;
      } else {
        console.log(`  Resposta ${i+1}: NÃO ENCONTRADA (assunto: ${matchAssunto}, tópico: ${matchTopico})`);
      }
    });
    
    console.log(`\nTotal de respostas encontradas: ${encontradas} de ${data.length}`);
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

collectAFOData();