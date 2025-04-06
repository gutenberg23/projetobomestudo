-- Verificar estrutura da tabela profiles
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela perfil
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'perfil'
ORDER BY ordinal_position;

-- Verificar triggers existentes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('profiles', 'perfil'); 