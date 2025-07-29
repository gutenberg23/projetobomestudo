-- Adicionar coluna resumo_audio_url à tabela topicos
ALTER TABLE IF EXISTS public.topicos
ADD COLUMN IF NOT EXISTS resumo_audio_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN public.topicos.resumo_audio_url IS 'URL do arquivo de áudio do resumo do tópico';