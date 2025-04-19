-- Renomear a coluna "topicos" para "assuntos" na tabela questoes
ALTER TABLE IF EXISTS public.questoes 
RENAME COLUMN topicos TO assuntos;

-- Criar a nova coluna "topicos" na tabela questoes
ALTER TABLE IF EXISTS public.questoes
ADD COLUMN IF NOT EXISTS topicos TEXT[] DEFAULT '{}';

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_questoes_topicos ON public.questoes USING gin(topicos);
CREATE INDEX IF NOT EXISTS idx_questoes_assuntos ON public.questoes USING gin(assuntos); 