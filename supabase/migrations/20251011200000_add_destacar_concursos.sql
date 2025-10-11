-- Adicionar coluna para destacar concursos na homepage
ALTER TABLE public.concursos 
ADD COLUMN IF NOT EXISTS destacar BOOLEAN DEFAULT FALSE;

-- Adicionar comentário à nova coluna
COMMENT ON COLUMN public.concursos.destacar IS 'Indica se o concurso deve ser destacado na homepage';

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS concursos_destacar_idx ON public.concursos(destacar) WHERE destacar = true;