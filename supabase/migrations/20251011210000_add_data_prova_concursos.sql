-- Adicionar coluna para a data da prova nos concursos
ALTER TABLE public.concursos 
ADD COLUMN IF NOT EXISTS data_prova DATE;

-- Adicionar comentário à nova coluna
COMMENT ON COLUMN public.concursos.data_prova IS 'Data da realização da prova do concurso';

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS concursos_data_prova_idx ON public.concursos(data_prova);