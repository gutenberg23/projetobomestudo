-- Add questoes_filtros and questoes_link columns to teorias table
ALTER TABLE public.teorias 
ADD COLUMN IF NOT EXISTS questoes_filtros JSONB,
ADD COLUMN IF NOT EXISTS questoes_link TEXT;

-- Create index for better performance on questoes_filtros
CREATE INDEX IF NOT EXISTS idx_teorias_questoes_filtros ON public.teorias USING GIN (questoes_filtros);