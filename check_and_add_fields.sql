-- Script para verificar e adicionar campos necessários à tabela disciplinas
-- Execute este script no banco de dados Supabase

-- Verificar se a tabela disciplinas existe e quais campos tem
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'disciplinas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar campos se não existirem
DO $$
BEGIN
    -- Adicionar campo topicos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' 
        AND column_name = 'topicos'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.disciplinas ADD COLUMN topicos TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Campo topicos adicionado à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Campo topicos já existe na tabela disciplinas';
    END IF;

    -- Adicionar campo links se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' 
        AND column_name = 'links'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.disciplinas ADD COLUMN links TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Campo links adicionado à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Campo links já existe na tabela disciplinas';
    END IF;

    -- Adicionar campo importancia se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' 
        AND column_name = 'importancia'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.disciplinas ADD COLUMN importancia INTEGER[] DEFAULT '{}';
        RAISE NOTICE 'Campo importancia adicionado à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Campo importancia já existe na tabela disciplinas';
    END IF;
END $$;

-- Verificar se a tabela cursoverticalizado existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'cursoverticalizado';

-- Criar tabela cursoverticalizado se não existir
CREATE TABLE IF NOT EXISTS public.cursoverticalizado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  disciplinas_ids TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Verificar se a função update_updated_at_column existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_updated_at_column';

-- Criar função se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger para cursoverticalizado se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_cursoverticalizado_updated_at'
        AND event_object_table = 'cursoverticalizado'
    ) THEN
        CREATE TRIGGER update_cursoverticalizado_updated_at
        BEFORE UPDATE ON public.cursoverticalizado
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger adicionado à tabela cursoverticalizado';
    ELSE
        RAISE NOTICE 'Trigger já existe na tabela cursoverticalizado';
    END IF;
END $$;

-- Verificar estrutura final da tabela disciplinas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'disciplinas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura final da tabela cursoverticalizado
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cursoverticalizado' 
AND table_schema = 'public'
ORDER BY ordinal_position;
