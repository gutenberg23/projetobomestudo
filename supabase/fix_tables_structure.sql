-- Verificar e adicionar colunas necessárias na tabela profiles
DO $$
BEGIN
    -- Adicionar coluna nivel se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'nivel') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN nivel TEXT CHECK (nivel IN ('usuario', 'assistente', 'professor', 'admin'));
    END IF;

    -- Adicionar coluna role se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'role') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT;
    END IF;

    -- Adicionar coluna status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'status') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN status TEXT CHECK (status IN ('ativo', 'inativo', 'pendente', 'bloqueado'));
    END IF;

    -- Fazer o mesmo para a tabela perfil
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'perfil' 
                  AND column_name = 'nivel') THEN
        ALTER TABLE public.perfil 
        ADD COLUMN nivel TEXT CHECK (nivel IN ('usuario', 'assistente', 'professor', 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'perfil' 
                  AND column_name = 'role') THEN
        ALTER TABLE public.perfil 
        ADD COLUMN role TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'perfil' 
                  AND column_name = 'status') THEN
        ALTER TABLE public.perfil 
        ADD COLUMN status TEXT CHECK (status IN ('ativo', 'inativo', 'pendente', 'bloqueado'));
    END IF;

END $$; 