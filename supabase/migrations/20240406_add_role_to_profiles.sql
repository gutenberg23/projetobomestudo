-- Primeiro removemos o tipo enum se ele existir
DROP TYPE IF EXISTS user_role CASCADE;

-- Criamos o tipo enum novamente
CREATE TYPE user_role AS ENUM ('admin', 'aluno', 'professor');

-- Removemos a coluna role se ela existir
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role;

-- Tornar colunas nullable
ALTER TABLE profiles 
ALTER COLUMN nivel DROP NOT NULL,
ALTER COLUMN status DROP NOT NULL;

-- Adicionar coluna email_confirmed_at se não existir
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Adicionamos a coluna novamente com o tipo correto
ALTER TABLE profiles 
ADD COLUMN role user_role NOT NULL DEFAULT 'aluno';

-- Garantir que a tabela perfil tem a estrutura correta
ALTER TABLE public.perfil
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS role user_role;

-- Verifica se o usuário existe e insere se não existir
INSERT INTO profiles (
  id, 
  email, 
  nome, 
  role,
  created_at,
  updated_at,
  data_cadastro,
  ultimo_login,
  status,
  email_confirmed_at
) VALUES (
  '7fcf658d-8f23-4ae9-9763-821294cd2500',
  'gutenberg23@gmail.com',
  'Admin',
  'admin',
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  'ativo',
  NOW()
) ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    status = 'ativo',
    updated_at = NOW(),
    email_confirmed_at = NOW();

-- Remove todas as policies antigas
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura completa do próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ler todos os perfis" ON profiles;

-- Desativa RLS temporariamente para debug
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Criar função para verificar se é admin de forma segura
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role user_role;
BEGIN
    SELECT role INTO _role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN _role = 'admin';
END;
$$;

-- Cria uma policy simples para leitura do próprio perfil
CREATE POLICY "Permitir leitura do próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR 
    auth.is_admin()
);

-- Garante que o serviço de autenticação tem acesso
GRANT ALL ON profiles TO service_role;
GRANT SELECT ON profiles TO authenticated;

-- Atualizar ou criar a função de sincronização
CREATE OR REPLACE FUNCTION public.sync_profiles_to_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Inserir ou atualizar na tabela perfil
    INSERT INTO public.perfil (
        id,
        email,
        nome,
        role,
        created_at,
        updated_at,
        data_cadastro,
        ultimo_login,
        status,
        email_confirmed_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.nome,
        NEW.role::user_role,  -- Garantir o tipo correto
        NEW.created_at::timestamp with time zone,
        NEW.updated_at::timestamp with time zone,
        NEW.data_cadastro::timestamp with time zone,
        NEW.ultimo_login::timestamp with time zone,
        NEW.status,
        NEW.email_confirmed_at::timestamp with time zone
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        nome = EXCLUDED.nome,
        role = EXCLUDED.role,
        updated_at = EXCLUDED.updated_at,
        ultimo_login = EXCLUDED.ultimo_login,
        status = EXCLUDED.status,
        email_confirmed_at = EXCLUDED.email_confirmed_at;
    
    RETURN NEW;
END;
$$; 