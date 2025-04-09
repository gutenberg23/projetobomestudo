-- Migração para corrigir problemas de permissões que causam o erro "Database error granting user"

-- 1. Remover possíveis funções personalizadas no esquema auth que possam estar causando o erro
DO $$
BEGIN
  -- Remover funções problemáticas que podem estar causando o erro
  DROP FUNCTION IF EXISTS auth.grant_user_roles() CASCADE;
  DROP FUNCTION IF EXISTS auth.check_user_roles() CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao remover funções: %', SQLERRM;
END $$;

-- 2. Garantir que as permissões básicas estejam corretamente configuradas
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Permissões específicas para usuários autenticados
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.auth_logs TO authenticated;

-- 3. Corrigir configurações de RLS para a tabela profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Administradores e equipe podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer perfil" ON public.profiles;
DROP POLICY IF EXISTS "Somente administradores podem alterar níveis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar informações básicas" ON public.profiles;

-- Criar políticas simples
CREATE POLICY "Permitir leitura do próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Permitir atualização do próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Reativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Garantir que o usuário admin tenha todas as permissões necessárias
DO $$
DECLARE
  v_admin_email TEXT := 'gutenberg23@gmail.com';
BEGIN
  -- Verificar se o usuário admin existe e atualizar seu perfil
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email) THEN
    -- Atualizar nível e status
    UPDATE public.profiles
    SET 
      nivel = 'admin',
      role = 'admin',
      status = 'ativo',
      updated_at = CURRENT_TIMESTAMP
    WHERE email = v_admin_email;
    
    RAISE NOTICE 'Perfil de admin atualizado com sucesso';
  ELSE
    RAISE NOTICE 'Usuário admin não encontrado';
  END IF;
END $$;

-- 5. Notificar sistema para recarregar configurações
NOTIFY pgrst, 'reload schema'; 