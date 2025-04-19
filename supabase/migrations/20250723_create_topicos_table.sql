-- Criar tabela para Tópicos
CREATE TABLE IF NOT EXISTS public.topicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  assunto TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(nome, assunto)
);

-- Adicionar coluna à tabela de questões
ALTER TABLE IF EXISTS public.questoes
ADD COLUMN IF NOT EXISTS topicos_ids TEXT[] DEFAULT '{}';

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_topicos_assunto ON public.topicos(assunto);
CREATE INDEX IF NOT EXISTS idx_topicos_disciplina ON public.topicos(disciplina);
CREATE INDEX IF NOT EXISTS idx_questoes_topicos_ids ON public.questoes USING gin(topicos_ids);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_topicos_updated_at
BEFORE UPDATE ON public.topicos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar políticas RLS
ALTER TABLE public.topicos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público de leitura
CREATE POLICY "Allow public read access" ON public.topicos FOR SELECT USING (true);

-- Políticas para permitir que usuários autenticados possam inserir, atualizar e excluir tópicos
CREATE POLICY "Users can insert topics" 
ON public.topicos 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update topics" 
ON public.topicos 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete topics" 
ON public.topicos 
FOR DELETE 
USING (auth.role() = 'authenticated'); 