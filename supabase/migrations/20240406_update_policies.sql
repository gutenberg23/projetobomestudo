-- Remover a policy antiga de leitura se existir
DROP POLICY IF EXISTS "Permitir leitura do próprio perfil" ON profiles;

-- Criar uma policy mais específica para leitura do role
CREATE POLICY "Permitir leitura completa do próprio perfil"
ON profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = id OR 
    EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'
    )
);

-- Garantir que o RLS está ativado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Garantir que o serviço de autenticação tem acesso
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO service_role;

-- Verificar se o usuário tem permissão de admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    );
$$; 