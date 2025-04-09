-- Função para verificar se uma tabela existe no schema público
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_name
  );
END;
$$;

-- Conceder permissão para executar a função
GRANT EXECUTE ON FUNCTION public.table_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.table_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.table_exists(text) TO service_role; 