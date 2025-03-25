-- Criar a tabela edital_verticalizado_data
CREATE TABLE IF NOT EXISTS edital_verticalizado_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  disciplina_id TEXT NOT NULL,
  topicos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id, disciplina_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS edital_verticalizado_data_user_id_idx ON edital_verticalizado_data(user_id);
CREATE INDEX IF NOT EXISTS edital_verticalizado_data_course_id_idx ON edital_verticalizado_data(course_id);
CREATE INDEX IF NOT EXISTS edital_verticalizado_data_disciplina_id_idx ON edital_verticalizado_data(disciplina_id);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_edital_verticalizado_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_edital_verticalizado_data_updated_at
  BEFORE UPDATE ON edital_verticalizado_data
  FOR EACH ROW
  EXECUTE FUNCTION update_edital_verticalizado_data_updated_at();

-- Políticas de segurança RLS
ALTER TABLE edital_verticalizado_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios dados"
  ON edital_verticalizado_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados"
  ON edital_verticalizado_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON edital_verticalizado_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios dados"
  ON edital_verticalizado_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 