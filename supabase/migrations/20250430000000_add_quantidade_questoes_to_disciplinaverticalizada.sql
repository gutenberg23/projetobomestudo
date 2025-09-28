-- Adicionar coluna para quantidade de questões encontradas nos filtros à tabela disciplinaverticalizada
ALTER TABLE public.disciplinaverticalizada
ADD COLUMN IF NOT EXISTS quantidade_questoes_filtro INTEGER[] DEFAULT '{}';