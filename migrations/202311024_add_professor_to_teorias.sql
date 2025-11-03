-- Adicionar coluna professor_id à tabela teorias
ALTER TABLE public.teorias 
ADD COLUMN professor_id UUID REFERENCES auth.users(id);