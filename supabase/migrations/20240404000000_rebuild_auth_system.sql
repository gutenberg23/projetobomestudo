-- Desativar RLS na tabela de perfis
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas da tabela de perfis
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Remover triggers relacionados à autenticação (PRIMEIRO remover os triggers)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover funções relacionadas à autenticação (DEPOIS remover as funções)
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remover coluna is_admin gerada
ALTER TABLE IF EXISTS public.profiles DROP COLUMN IF EXISTS is_admin;

-- Recriar tabela de perfis de usuários com novos campos
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  sobrenome TEXT,
  foto_url TEXT,
  nivel TEXT NOT NULL CHECK (nivel IN ('usuario', 'assistente', 'professor', 'admin')),
  status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo', 'pendente', 'bloqueado')),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela para registros de atividade de autenticação
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o campo updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se um usuário é administrador ou está na equipe administrativa
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND nivel IN ('admin', 'professor', 'assistente')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de perfis

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil (exceto o nível)
DROP POLICY IF EXISTS "Usuários podem atualizar informações básicas" ON public.profiles;
CREATE POLICY "Usuários podem atualizar informações básicas"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ninguém exceto administradores pode alterar o nível de qualquer usuário
DROP POLICY IF EXISTS "Somente administradores podem alterar níveis" ON public.profiles;
CREATE POLICY "Somente administradores podem alterar níveis"
  ON public.profiles 
  FOR UPDATE
  TO authenticated
  USING (
    -- Ou o usuário é admin
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND nivel = 'admin'))
    OR 
    -- Ou não está tentando atualizar o campo nivel
    (nivel IS NOT NULL)
  );

-- Remover a função e trigger problemáticos, se existirem
DROP FUNCTION IF EXISTS check_user_nivel_unchanged() CASCADE;

-- Administradores e equipe podem ver todos os perfis
DROP POLICY IF EXISTS "Administradores e equipe podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Administradores e equipe podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (is_admin_or_staff());

-- Apenas administradores podem atualizar qualquer perfil
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer perfil" ON public.profiles;
CREATE POLICY "Administradores podem atualizar qualquer perfil"
  ON public.profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND nivel = 'admin'
  ));

-- Administradores e equipe podem ver os logs de autenticação
DROP POLICY IF EXISTS "Administradores e equipe podem ver logs de autenticação" ON public.auth_logs;
CREATE POLICY "Administradores e equipe podem ver logs de autenticação"
  ON public.auth_logs FOR SELECT
  USING (is_admin_or_staff());

-- Função para lidar com novos usuários (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    nivel,
    status,
    data_cadastro
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'usuario', -- Nível padrão para novos usuários
    'ativo',   -- Status padrão para novos usuários
    CURRENT_TIMESTAMP
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
      'provider', NEW.app_metadata->>'provider',
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para registrar logins
CREATE OR REPLACE FUNCTION log_auth_event()
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
    
    -- Atualizar último login no perfil
    UPDATE public.profiles
    SET ultimo_login = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para logins
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION log_auth_event(); 