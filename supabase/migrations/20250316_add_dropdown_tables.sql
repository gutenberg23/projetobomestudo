-- Criar tabela para Banca (institution)
CREATE TABLE IF NOT EXISTS public.bancas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Instituição (organization)
CREATE TABLE IF NOT EXISTS public.instituicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Ano (year)
CREATE TABLE IF NOT EXISTS public.anos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valor TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Cargos (role)
CREATE TABLE IF NOT EXISTS public.cargos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Disciplina (discipline)
CREATE TABLE IF NOT EXISTS public.disciplinas_questoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Assuntos (anteriormente tópicos)
CREATE TABLE IF NOT EXISTS public.assuntos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  patrocinador TEXT,
  questoes_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(nome, disciplina)
);

-- Criar tabela para Nível (level)
CREATE TABLE IF NOT EXISTS public.niveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Dificuldade (difficulty)
CREATE TABLE IF NOT EXISTS public.dificuldades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para Tipo de Questão (questiontype)
CREATE TABLE IF NOT EXISTS public.tipos_questao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar dados do edital verticalizado
CREATE TABLE IF NOT EXISTS public.edital_verticalizado_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  disciplina_id TEXT NOT NULL,
  topicos JSONB NOT NULL DEFAULT '[]',
  importancia INTEGER,
  dificuldade TEXT,
  total_exercicios INTEGER,
  acertos INTEGER,
  revisado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, disciplina_id)
);

-- Adicionar trigger para atualizar o campo updated_at automaticamente para todas as tabelas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar triggers para cada tabela
CREATE TRIGGER update_bancas_updated_at
BEFORE UPDATE ON public.bancas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instituicoes_updated_at
BEFORE UPDATE ON public.instituicoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anos_updated_at
BEFORE UPDATE ON public.anos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cargos_updated_at
BEFORE UPDATE ON public.cargos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disciplinas_questoes_updated_at
BEFORE UPDATE ON public.disciplinas_questoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assuntos_updated_at
BEFORE UPDATE ON public.assuntos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_niveis_updated_at
BEFORE UPDATE ON public.niveis
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dificuldades_updated_at
BEFORE UPDATE ON public.dificuldades
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_questao_updated_at
BEFORE UPDATE ON public.tipos_questao
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edital_verticalizado_data_updated_at
BEFORE UPDATE ON public.edital_verticalizado_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar políticas de segurança baseadas em linha (RLS)
ALTER TABLE public.bancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinas_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dificuldades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_questao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edital_verticalizado_data ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público de leitura
CREATE POLICY "Allow public read access" ON public.bancas FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.instituicoes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.anos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.cargos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.disciplinas_questoes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.assuntos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.niveis FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.dificuldades FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.tipos_questao FOR SELECT USING (true);
CREATE POLICY "Users can view their own edital data" 
ON public.edital_verticalizado_data 
FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para permitir que apenas usuários autenticados com função de admin possam modificar
CREATE POLICY "Allow admin insert" ON public.bancas FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.bancas FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.bancas FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.instituicoes FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.instituicoes FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.instituicoes FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.anos FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.anos FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.anos FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.cargos FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.cargos FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.cargos FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.disciplinas_questoes FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.disciplinas_questoes FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.disciplinas_questoes FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.assuntos FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.assuntos FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.assuntos FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.niveis FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.niveis FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.niveis FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.dificuldades FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.dificuldades FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.dificuldades FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin insert" ON public.tipos_questao FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update" ON public.tipos_questao FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin delete" ON public.tipos_questao FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own edital data" 
ON public.edital_verticalizado_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own edital data" 
ON public.edital_verticalizado_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own edital data" 
ON public.edital_verticalizado_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Adicionar índices para melhorar performance
CREATE INDEX idx_edital_verticalizado_data_user_id ON public.edital_verticalizado_data(user_id);
CREATE INDEX idx_edital_verticalizado_data_course_id ON public.edital_verticalizado_data(course_id);
CREATE INDEX idx_edital_verticalizado_data_disciplina_id ON public.edital_verticalizado_data(disciplina_id);
CREATE INDEX idx_edital_verticalizado_data_user_course ON public.edital_verticalizado_data(user_id, course_id);
