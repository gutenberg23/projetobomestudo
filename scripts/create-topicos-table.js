import { createClient } from '@supabase/supabase-js';

// Usar as mesmas credenciais do cliente Supabase
const supabaseUrl = 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2F0bW9hdGh4aGJhZWxzdHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyODQ0NjIsImV4cCI6MjA1Njg2MDQ2Mn0.0cscM4NYNvx6jxEvy4TXLcohdP4iRPHHPWHVHF6mjuU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTopicosTable() {
  console.log('Criando tabela topicos...');

  // Criar a tabela topicos
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.topicos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        nome TEXT NOT NULL,
        patrocinador TEXT,
        disciplina TEXT NOT NULL,
        questoes_ids TEXT[],
        professor_id UUID REFERENCES auth.users(id),
        professor_nome TEXT,
        video_url TEXT,
        pdf_url TEXT,
        mapa_url TEXT,
        resumo_url TEXT,
        musica_url TEXT,
        resumo_audio_url TEXT,
        caderno_questoes_url TEXT,
        abrir_em_nova_guia BOOLEAN DEFAULT false
      );
      
      -- Habilitar RLS
      ALTER TABLE public.topicos ENABLE ROW LEVEL SECURITY;
      
      -- Criar políticas de acesso
      CREATE POLICY "Leitura pública de topicos"
      ON public.topicos FOR SELECT
      TO public
      USING (true);
      
      CREATE POLICY "Admins e professores gerenciam topicos"
      ON public.topicos FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() 
          AND ur.role IN ('admin', 'professor')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() 
          AND ur.role IN ('admin', 'professor')
        )
      );
      
      -- Criar função para atualizar updated_at se não existir
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Criar trigger para atualizar updated_at
      DROP TRIGGER IF EXISTS update_topicos_updated_at ON public.topicos;
      CREATE TRIGGER update_topicos_updated_at 
          BEFORE UPDATE ON public.topicos 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `
  });

  if (tableError) {
    console.error('Erro ao criar tabela topicos:', tableError);
    return false;
  }

  console.log('Tabela topicos criada com sucesso!');
  return true;
}

// Executar a função
createTopicosTable()
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