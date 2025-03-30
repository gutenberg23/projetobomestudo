-- Criar tabela para questões
CREATE TABLE IF NOT EXISTS public.questoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  institution TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  discipline TEXT NOT NULL,
  level TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  questiontype TEXT NOT NULL,
  content TEXT NOT NULL,
  teacherexplanation TEXT,
  aiexplanation TEXT,
  expandablecontent TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  topicos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_questoes_updated_at
BEFORE UPDATE ON public.questoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar políticas RLS
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público de leitura
CREATE POLICY "Allow public read access" ON public.questoes FOR SELECT USING (true);

-- Políticas para permitir que usuários autenticados possam inserir e atualizar suas próprias questões
CREATE POLICY "Users can insert their own questions" 
ON public.questoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
ON public.questoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" 
ON public.questoes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para melhorar performance
CREATE INDEX idx_questoes_user_id ON public.questoes(user_id);
CREATE INDEX idx_questoes_discipline ON public.questoes(discipline);
CREATE INDEX idx_questoes_year ON public.questoes(year);
CREATE INDEX idx_questoes_institution ON public.questoes(institution);
CREATE INDEX idx_questoes_organization ON public.questoes(organization); 