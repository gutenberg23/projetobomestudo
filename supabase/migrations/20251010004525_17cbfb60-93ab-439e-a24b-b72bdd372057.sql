-- Sincronizar roles existentes da tabela profiles para user_roles
BEGIN;

-- Inserir roles da tabela profiles na tabela user_roles (se não existirem)
-- Para usuários que têm role='admin' no profiles
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'admin'::app_role
FROM public.profiles p
WHERE (p.role = 'admin' OR p.nivel = 'admin')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'admin'::app_role
  );

-- Para usuários que têm role='professor' no profiles
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'professor'::app_role
FROM public.profiles p
WHERE (p.role = 'professor' OR p.nivel = 'professor')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'professor'::app_role
  );

-- Para usuários que têm role='assistente' no profiles
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'assistente'::app_role
FROM public.profiles p
WHERE (p.role = 'assistente' OR p.nivel = 'assistente')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'assistente'::app_role
  );

-- Para usuários que têm role='jornalista' no profiles
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'jornalista'::app_role
FROM public.profiles p
WHERE (p.role = 'jornalista' OR p.nivel = 'jornalista')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'jornalista'::app_role
  );

-- Criar função para sincronizar automaticamente mudanças no profiles para user_roles
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remover roles antigas se houver mudança
  IF TG_OP = 'UPDATE' THEN
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.id;
  END IF;
  
  -- Adicionar role baseado no campo 'role' ou 'nivel'
  IF NEW.role = 'admin' OR NEW.nivel = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  IF NEW.role = 'professor' OR NEW.nivel = 'professor' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'professor'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  IF NEW.role = 'assistente' OR NEW.nivel = 'assistente' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'assistente'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  IF NEW.role = 'jornalista' OR NEW.nivel = 'jornalista' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'jornalista'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para sincronizar automaticamente
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON public.profiles;
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OF role, nivel ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_user_roles();

COMMIT;