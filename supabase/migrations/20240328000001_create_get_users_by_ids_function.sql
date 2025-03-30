-- Criar função para buscar usuários por IDs
CREATE OR REPLACE FUNCTION public.get_users_by_ids(user_ids uuid[])
RETURNS TABLE (
    id uuid,
    email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.email::text
    FROM auth.users au
    WHERE au.id = ANY(user_ids);
END;
$$; 