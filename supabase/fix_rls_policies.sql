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
DECLARE
  v_nivel text;
BEGIN
  SELECT nivel INTO v_nivel
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN v_nivel = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar novas políticas

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

-- Atualizar a função de sincronização entre profiles e perfil
CREATE OR REPLACE FUNCTION public.sync_profiles_to_perfil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar na tabela perfil
  INSERT INTO public.perfil (
    id,
    email,
    nome,
    nivel,
    status,
    role,
    assinante,
    inicio_assinatura,
    termino_assinatura,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.nome,
    NEW.nivel,
    NEW.status,
    NEW.role,
    NEW.assinante,
    NEW.inicio_assinatura,
    NEW.termino_assinatura,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    nivel = EXCLUDED.nivel,
    status = EXCLUDED.status,
    role = EXCLUDED.role,
    assinante = EXCLUDED.assinante,
    inicio_assinatura = EXCLUDED.inicio_assinatura,
    termino_assinatura = EXCLUDED.termino_assinatura,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$;

-- Recriar o trigger para sincronização
DROP TRIGGER IF EXISTS sync_profiles_to_perfil_trigger ON public.profiles;
CREATE TRIGGER sync_profiles_to_perfil_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profiles_to_perfil(); 