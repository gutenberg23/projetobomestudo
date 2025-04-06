-- Desativar RLS na tabela de perfis
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas da tabela de perfis
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Remover funções relacionadas à autenticação
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remover triggers relacionados à autenticação
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover coluna is_admin gerada
ALTER TABLE IF EXISTS public.profiles DROP COLUMN IF EXISTS is_admin; 