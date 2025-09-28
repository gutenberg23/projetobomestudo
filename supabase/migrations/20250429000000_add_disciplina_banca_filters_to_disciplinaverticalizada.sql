-- Adicionar colunas para filtros de disciplina e banca à tabela disciplinaverticalizada
ALTER TABLE public.disciplinaverticalizada
ADD COLUMN IF NOT EXISTS disciplinas_filtro TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bancas_filtro TEXT[] DEFAULT '{}';