-- Script para adicionar colunas que podem estar faltando na tabela profiles

-- Adicionar a coluna 'role' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT;
    RAISE NOTICE 'Coluna "role" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "role" já existe na tabela';
  END IF;
END $$;

-- Adicionar a coluna 'nivel' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'nivel'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN nivel TEXT NOT NULL DEFAULT 'usuario';
    RAISE NOTICE 'Coluna "nivel" adicionada com sucesso (NOT NULL, DEFAULT "usuario")';
  ELSE
    RAISE NOTICE 'Coluna "nivel" já existe na tabela';
  END IF;
END $$;

-- Adicionar a coluna 'status' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'ativo';
    RAISE NOTICE 'Coluna "status" adicionada com sucesso (DEFAULT "ativo")';
  ELSE
    RAISE NOTICE 'Coluna "status" já existe na tabela';
  END IF;
END $$;

-- Mostrar a estrutura atual da tabela após as alterações
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY 
  ordinal_position; 