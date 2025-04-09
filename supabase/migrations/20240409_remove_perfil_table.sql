-- Migração para remover a tabela 'perfil' e triggers relacionados
-- Como agora usamos apenas a tabela 'profiles'

-- Remover triggers de sincronização (apenas se existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_profiles_to_perfil_trigger') THEN
    DROP TRIGGER IF EXISTS sync_profiles_to_perfil_trigger ON public.profiles CASCADE;
    RAISE NOTICE 'Trigger sync_profiles_to_perfil_trigger removido com sucesso';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_auth_users_to_perfil_trigger') THEN
    DROP TRIGGER IF EXISTS sync_auth_users_to_perfil_trigger ON auth.users CASCADE;
    RAISE NOTICE 'Trigger sync_auth_users_to_perfil_trigger removido com sucesso';
  END IF;
END $$;

-- Remover funções de sincronização (apenas se existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sync_profiles_to_perfil') THEN
    DROP FUNCTION IF EXISTS public.sync_profiles_to_perfil() CASCADE;
    RAISE NOTICE 'Função sync_profiles_to_perfil removida com sucesso';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sync_auth_users_to_perfil') THEN
    DROP FUNCTION IF EXISTS public.sync_auth_users_to_perfil() CASCADE;
    RAISE NOTICE 'Função sync_auth_users_to_perfil removida com sucesso';
  END IF;
END $$;

-- Remover a tabela perfil (apenas se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'perfil') THEN
    -- Remover políticas RLS da tabela perfil
    DROP POLICY IF EXISTS "Permitir leitura do próprio perfil na tabela perfil" ON public.perfil;
    DROP POLICY IF EXISTS "Permitir acesso total ao próprio perfil na tabela perfil" ON public.perfil;
    
    -- Remover a tabela
    DROP TABLE public.perfil CASCADE;
    RAISE NOTICE 'Tabela perfil e políticas relacionadas removidas com sucesso';
  ELSE
    RAISE NOTICE 'Tabela perfil já não existe, nada a remover';
  END IF;
END $$;

-- Registrar ação
DO $$
BEGIN
  RAISE NOTICE 'Tabela perfil e recursos relacionados foram removidos com sucesso';
END $$; 