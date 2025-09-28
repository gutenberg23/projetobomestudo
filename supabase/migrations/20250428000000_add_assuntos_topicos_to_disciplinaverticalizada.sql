-- Adicionar colunas de assuntos e tópicos à tabela disciplinaverticalizada
ALTER TABLE public.disciplinaverticalizada
ADD COLUMN IF NOT EXISTS assuntos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS topicos_filtro TEXT[] DEFAULT '{}';