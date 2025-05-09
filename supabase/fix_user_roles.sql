-- Primeiro, remover todas as políticas existentes
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

-- Criar novas políticas mais permissivas para administradores

-- 1. Política para visualização
CREATE POLICY "Visualização de perfis"
ON public.profiles FOR SELECT
USING (
  -- Usuários podem ver seu próprio perfil OU administradores podem ver todos
  auth.uid() = id OR is_admin()
);

-- 2. Política para atualização
CREATE POLICY "Atualização de perfis"
ON public.profiles FOR UPDATE
USING (
  -- Apenas administradores podem atualizar qualquer perfil
  is_admin()
)
WITH CHECK (
  -- Verificação adicional para garantir que apenas admins podem alterar roles
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

-- Função para atualizar role e nivel
CREATE OR REPLACE FUNCTION update_user_role(
  user_id UUID,
  new_role TEXT,
  new_nivel TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário executando é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem atualizar roles';
  END IF;

  -- Atualizar profiles
  UPDATE public.profiles
  SET 
    role = new_role,
    nivel = new_nivel,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = user_id;
END;
$$; 