-- Criação da tabela de concursos
CREATE TABLE IF NOT EXISTS public.concursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  data_inicio_inscricao DATE NOT NULL,
  data_fim_inscricao DATE NOT NULL,
  prorrogado BOOLEAN DEFAULT FALSE,
  niveis TEXT[] DEFAULT '{}',
  cargos TEXT[] DEFAULT '{}',
  vagas INTEGER NOT NULL,
  salario TEXT NOT NULL,
  estados TEXT[] DEFAULT '{}',
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE public.concursos IS 'Tabela de concursos públicos disponíveis';
COMMENT ON COLUMN public.concursos.id IS 'Identificador único do concurso';
COMMENT ON COLUMN public.concursos.titulo IS 'Título do concurso';
COMMENT ON COLUMN public.concursos.data_inicio_inscricao IS 'Data de início do período de inscrição';
COMMENT ON COLUMN public.concursos.data_fim_inscricao IS 'Data final do período de inscrição';
COMMENT ON COLUMN public.concursos.prorrogado IS 'Indica se o concurso teve o prazo de inscrição prorrogado';
COMMENT ON COLUMN public.concursos.niveis IS 'Lista de níveis de ensino exigidos';
COMMENT ON COLUMN public.concursos.cargos IS 'Lista de cargos disponíveis no concurso';
COMMENT ON COLUMN public.concursos.vagas IS 'Número total de vagas oferecidas';
COMMENT ON COLUMN public.concursos.salario IS 'Valor ou faixa salarial do concurso';
COMMENT ON COLUMN public.concursos.estados IS 'Lista de estados onde o concurso é válido';
COMMENT ON COLUMN public.concursos.post_id IS 'Referência ao post do blog com mais detalhes';
COMMENT ON COLUMN public.concursos.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.concursos.updated_at IS 'Data da última atualização do registro';

-- Índices
CREATE INDEX IF NOT EXISTS concursos_data_inicio_inscricao_idx ON public.concursos(data_inicio_inscricao);
CREATE INDEX IF NOT EXISTS concursos_data_fim_inscricao_idx ON public.concursos(data_fim_inscricao);
CREATE INDEX IF NOT EXISTS concursos_post_id_idx ON public.concursos(post_id);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_concurso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_concurso_updated_at
BEFORE UPDATE ON public.concursos
FOR EACH ROW
EXECUTE FUNCTION update_concurso_updated_at();

-- Configurar permissões RLS (Row Level Security)
ALTER TABLE public.concursos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY concursos_select_policy ON public.concursos
  FOR SELECT USING (true);

-- Política para permitir inserção apenas para usuários autenticados com função de admin
CREATE POLICY concursos_insert_policy ON public.concursos
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND (
        -- Usuário é admin ou editor
        raw_user_meta_data->>'role' = 'admin' OR
        raw_user_meta_data->>'role' = 'editor'
      )
    )
  );

-- Política para permitir atualização apenas para usuários autenticados com função de admin
CREATE POLICY concursos_update_policy ON public.concursos
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND (
        -- Usuário é admin ou editor
        raw_user_meta_data->>'role' = 'admin' OR
        raw_user_meta_data->>'role' = 'editor'
      )
    )
  );

-- Política para permitir exclusão apenas para usuários autenticados com função de admin
CREATE POLICY concursos_delete_policy ON public.concursos
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND (
        -- Somente admin pode excluir
        raw_user_meta_data->>'role' = 'admin'
      )
    )
  ); 