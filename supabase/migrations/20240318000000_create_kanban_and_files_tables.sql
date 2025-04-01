-- Criar tabela de colunas do kanban
CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de itens do kanban
CREATE TABLE IF NOT EXISTS kanban_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  column_id UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de arquivos
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT,
  url TEXT,
  parent_id UUID REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Inserir colunas padrão do kanban
INSERT INTO kanban_columns (title, "order") VALUES
  ('Ideias', 1),
  ('Próximo', 2),
  ('Em Progresso', 3),
  ('Feito', 4)
ON CONFLICT DO NOTHING;

-- Criar políticas de segurança RLS
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Políticas para kanban_columns
CREATE POLICY "Permitir acesso total para usuários autenticados" ON kanban_columns
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para kanban_items
CREATE POLICY "Permitir acesso total para usuários autenticados" ON kanban_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para files
CREATE POLICY "Permitir acesso total para usuários autenticados" ON files
  FOR ALL USING (auth.role() = 'authenticated'); 