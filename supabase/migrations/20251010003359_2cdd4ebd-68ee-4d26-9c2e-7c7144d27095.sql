-- FASE 1: ESTRUTURA DE ROLES E SEGURANÇA

-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'assistente', 'jornalista', 'usuario');

-- 2. Criar tabela de roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função SECURITY DEFINER para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 6. Função para impedir mudança de role/nivel por não-admins
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se não é admin e está tentando mudar role ou nivel
  IF NOT public.is_admin() AND (
    (OLD.role IS DISTINCT FROM NEW.role) OR 
    (OLD.nivel IS DISTINCT FROM NEW.nivel)
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles e níveis';
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Políticas RLS para user_roles
CREATE POLICY "Somente admins podem inserir roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Somente admins podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Somente admins podem deletar roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Usuários podem ver seus próprios roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- 8. Migrar dados existentes da tabela profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' OR nivel = 'admin' THEN 'admin'::app_role
    WHEN role = 'professor' OR nivel = 'professor' THEN 'professor'::app_role
    WHEN role = 'assistente' OR nivel = 'assistente' THEN 'assistente'::app_role
    WHEN role = 'jornalista' THEN 'jornalista'::app_role
    ELSE 'usuario'::app_role
  END
FROM public.profiles
WHERE (role IS NOT NULL OR nivel IS NOT NULL)
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Remover políticas inseguras da tabela profiles
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir acesso total ao próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Atualização de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Deleção de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Inserção de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Visualização de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON public.profiles;

-- 10. Criar políticas seguras para profiles
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Usuários veem próprio perfil"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins veem todos os perfis"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- Usuários podem atualizar apenas seu próprio perfil (role/nivel protegidos por trigger)
CREATE POLICY "Usuários atualizam próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins podem atualizar qualquer perfil
CREATE POLICY "Admins atualizam perfis"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 11. Adicionar trigger para proteção contra escalação de privilégios
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();