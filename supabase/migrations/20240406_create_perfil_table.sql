-- Remover objetos existentes para evitar conflitos
DROP TRIGGER IF EXISTS sync_auth_users_to_perfil_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS sync_auth_users_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS sync_profiles_to_perfil_trigger ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.sync_auth_users_to_perfil() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profiles_to_perfil() CASCADE;
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil na tabela perfil" ON public.perfil;

-- Remover tabelas se existirem
DROP TABLE IF EXISTS public.perfil CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Criar a tabela profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    foto_url TEXT,
    nivel TEXT CHECK (nivel IN ('usuario', 'assistente', 'professor', 'admin')),
    status TEXT CHECK (status IN ('ativo', 'inativo', 'pendente', 'bloqueado')),
    role TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela perfil
CREATE TABLE public.perfil (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    foto_url TEXT,
    nivel TEXT CHECK (nivel IN ('usuario', 'assistente', 'professor', 'admin')),
    status TEXT CHECK (status IN ('ativo', 'inativo', 'pendente', 'bloqueado')),
    role TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar último login
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar último login em ambas as tabelas
    UPDATE public.profiles
    SET 
        ultimo_login = NEW.last_sign_in_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    
    UPDATE public.perfil
    SET 
        ultimo_login = NEW.last_sign_in_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Função para sincronizar profiles com perfil
CREATE OR REPLACE FUNCTION public.sync_profiles_to_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.perfil (
        id,
        email,
        nome,
        sobrenome,
        nivel,
        status,
        role,
        data_cadastro,
        ultimo_login,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.nome,
        NEW.sobrenome,
        NEW.nivel,
        NEW.status,
        NEW.role,
        NEW.data_cadastro,
        NEW.ultimo_login,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        nome = EXCLUDED.nome,
        sobrenome = EXCLUDED.sobrenome,
        nivel = EXCLUDED.nivel,
        status = EXCLUDED.status,
        role = EXCLUDED.role,
        ultimo_login = EXCLUDED.ultimo_login,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$;

-- Criar triggers
CREATE TRIGGER handle_auth_user_update_trigger
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_update();

CREATE TRIGGER sync_profiles_to_perfil_trigger
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profiles_to_perfil();

-- Garantir que o serviço de autenticação tem acesso
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir acesso total ao próprio perfil"
ON public.profiles FOR ALL
TO authenticated
USING (
    auth.uid() = id OR 
    EXISTS (
        SELECT 1 
        FROM auth.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'authenticated'
    )
);

CREATE POLICY "Permitir acesso total ao próprio perfil na tabela perfil"
ON public.perfil FOR ALL
TO authenticated
USING (
    auth.uid() = id OR 
    EXISTS (
        SELECT 1 
        FROM auth.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'authenticated'
    )
);

-- Inserir o usuário admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    aud,
    created_at,
    updated_at
)
VALUES (
    '7fcf658d-8f23-4ae9-9763-821294cd2500',
    'gutenberg23@gmail.com',
    crypt('123456', gen_salt('bf')),
    CURRENT_TIMESTAMP,
    'authenticated',
    'authenticated',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE
SET
    email_confirmed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;

-- Inserir o perfil do admin em ambas as tabelas
INSERT INTO public.profiles (
    id,
    email,
    nome,
    nivel,
    status,
    role,
    created_at,
    updated_at,
    data_cadastro
)
VALUES (
    '7fcf658d-8f23-4ae9-9763-821294cd2500',
    'gutenberg23@gmail.com',
    'Administrador',
    'admin',
    'ativo',
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE
SET
    nivel = 'admin',
    status = 'ativo',
    role = 'admin',
    updated_at = CURRENT_TIMESTAMP;

-- Copiar dados para a tabela perfil
INSERT INTO public.perfil (
    id,
    email,
    nome,
    nivel,
    status,
    role,
    created_at,
    updated_at,
    data_cadastro
)
SELECT
    id,
    email,
    nome,
    nivel,
    status,
    role,
    created_at,
    updated_at,
    data_cadastro
FROM public.profiles
ON CONFLICT (id) DO UPDATE
SET
    nivel = EXCLUDED.nivel,
    status = EXCLUDED.status,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP; 