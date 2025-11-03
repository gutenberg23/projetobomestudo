-- Alter teorias table to change topicos_ids from UUID[] to TEXT[]
ALTER TABLE public.teorias 
ALTER COLUMN topicos_ids TYPE TEXT[] USING topicos_ids::TEXT[];