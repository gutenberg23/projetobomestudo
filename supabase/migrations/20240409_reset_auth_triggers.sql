-- Migração de emergência para resolver problemas de login após a remoção da tabela 'perfil'

-- 1. Remover TODOS os triggers e funções relacionados à autenticação
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_auth_user_update_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS sync_profiles_to_perfil_trigger ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS sync_auth_users_to_perfil_trigger ON auth.users CASCADE;

DROP FUNCTION IF EXISTS public.log_auth_event() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profiles_to_perfil() CASCADE;
DROP FUNCTION IF EXISTS public.sync_auth_users_to_perfil() CASCADE;

-- 2. Limpar todas as tabelas e políticas que possam estar interferindo
DO $$
BEGIN
  -- Remover tabela perfil e suas políticas se ainda existirem
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'perfil') THEN
    RAISE NOTICE 'Removendo tabela perfil...';
    DROP TABLE public.perfil CASCADE;
  END IF;
  
  -- Remover políticas RLS relacionadas à tabela perfil
  EXECUTE 'DROP POLICY IF EXISTS "Permitir leitura do próprio perfil na tabela perfil" ON public.perfil';
  EXECUTE 'DROP POLICY IF EXISTS "Permitir acesso total ao próprio perfil na tabela perfil" ON public.perfil';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao limpar tabela perfil: %', SQLERRM;
END $$;

-- 3. Recriar as funções essenciais de autenticação de forma limpa

-- Função para registrar evento de login
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.created_at > (NOW() - INTERVAL '5 seconds') THEN
    -- Registrar login bem-sucedido
    INSERT INTO public.auth_logs (
      user_id,
      event_type,
      ip_address,
      metadata
    )
    VALUES (
      NEW.user_id,
      'login',
      NEW.ip::TEXT,
      jsonb_build_object('provider', NEW.provider)
    );
    
    -- Atualizar último login na tabela profiles
    UPDATE public.profiles
    SET 
      ultimo_login = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na tabela profiles
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    nivel,
    status,
    data_cadastro,
    ultimo_login,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'usuario',
    'ativo',
    NEW.created_at,
    NEW.last_sign_in_at,
    NEW.created_at,
    NEW.updated_at
  );
  
  -- Registrar evento de criação de conta
  INSERT INTO public.auth_logs (
    user_id,
    event_type,
    metadata
  )
  VALUES (
    NEW.id,
    'signup',
    jsonb_build_object(
      'provider', COALESCE(NEW.app_metadata->>'provider', NEW.raw_app_meta_data->>'provider', 'email'),
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar último login após autenticação
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar último login na tabela profiles
  UPDATE public.profiles
  SET 
    ultimo_login = NEW.last_sign_in_at,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar os triggers
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.log_auth_event();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER handle_auth_user_update_trigger
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_update();

-- 5. Reiniciar a sessão do Supabase para limpar cache
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid() AND 
      application_name = 'PostgREST' AND 
      backend_type = 'client backend';

-- Recarregar configurações do PostgREST
NOTIFY pgrst, 'reload schema'; 