-- Adicionar campos de assinatura na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS assinante BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS inicio_assinatura TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS termino_assinatura TIMESTAMP WITH TIME ZONE;

-- Adicionar campos de assinatura na tabela perfil
ALTER TABLE public.perfil
ADD COLUMN IF NOT EXISTS assinante BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS inicio_assinatura TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS termino_assinatura TIMESTAMP WITH TIME ZONE; 