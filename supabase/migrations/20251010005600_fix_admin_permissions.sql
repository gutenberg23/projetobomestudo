-- Corrigir permissões de administrador

-- Verificar se há usuários sem roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.nivel = 'admin' 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id 
      AND ur.role = 'admin'::app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se há usuários com role admin mas sem nivel admin (corrigir inconsistência)
UPDATE public.profiles 
SET nivel = 'admin'
WHERE id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'::app_role
)
AND (nivel IS NULL OR nivel != 'admin');

-- Verificar se há usuários com nivel admin mas sem role admin (corrigir inconsistência)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles 
WHERE nivel = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = profiles.id 
      AND ur.role = 'admin'::app_role
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Garantir que a função is_admin está correta
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
  )
$$;

-- Garantir que a função has_role está correta
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