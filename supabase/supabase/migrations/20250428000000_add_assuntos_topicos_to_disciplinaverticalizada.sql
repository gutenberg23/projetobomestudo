-- Adiciona colunas de filtros à tabela disciplinaverticalizada
ALTER TABLE disciplinaverticalizada 
ADD COLUMN IF NOT EXISTS assuntos TEXT[],
ADD COLUMN IF NOT EXISTS topicos_filtro TEXT[],
ADD COLUMN IF NOT EXISTS disciplinas_filtro TEXT[],
ADD COLUMN IF NOT EXISTS bancas_filtro TEXT[],
ADD COLUMN IF NOT EXISTS quantidade_questoes_filtro INTEGER[];