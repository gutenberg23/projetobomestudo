-- Criar função para verificar se uma tabela existe no banco de dados
-- Esta função é útil para verificações de disponibilidade de recursos
CREATE OR REPLACE FUNCTION public.check_table_exists(
    table_name TEXT,
    schema_name TEXT DEFAULT 'public'
)
RETURNS BOOLEAN AS $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = schema_name
        AND table_name = check_table_exists.table_name
    ) INTO table_exists;
    
    RETURN table_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 