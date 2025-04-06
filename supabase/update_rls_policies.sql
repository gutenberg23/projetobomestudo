-- Primeiro, vamos remover as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Administradores e equipe podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer perfil" ON public.profiles;
DROP POLICY IF EXISTS "Somente administradores podem alterar níveis" ON public.profiles;
DROP POLICY IF EXISTS "Visualização de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Atualização de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Inserção de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Deleção de perfis" ON public.profiles;

-- Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Criar função para verificar se é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND nivel = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para verificar se é o próprio usuário
CREATE OR REPLACE FUNCTION is_own_profile(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agora vamos criar as novas políticas

-- 1. Política para visualização
CREATE POLICY "Visualização de perfis"
ON public.profiles FOR SELECT
USING (
  -- Usuários podem ver seu próprio perfil OU administradores podem ver todos
  is_own_profile(id) OR is_admin()
);

-- 2. Política para atualização
CREATE POLICY "Atualização de perfis"
ON public.profiles FOR UPDATE
USING (
  -- Administradores podem atualizar qualquer perfil
  is_admin()
);

-- 3. Política para inserção
CREATE POLICY "Inserção de perfis"
ON public.profiles FOR INSERT
WITH CHECK (
  -- Apenas administradores podem inserir novos perfis
  is_admin()
);

-- 4. Política para deleção
CREATE POLICY "Deleção de perfis"
ON public.profiles FOR DELETE
USING (
  -- Apenas administradores podem deletar perfis
  is_admin()
);

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Garantir que o serviço tem acesso total
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated; 