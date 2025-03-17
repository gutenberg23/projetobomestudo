
-- Função para verificar se uma tabela existe
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
$$;
