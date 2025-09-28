-- Verificar a estrutura da tabela disciplinaverticalizada
\d disciplinaverticalizada;

-- Ou alternativamente, verificar as colunas da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'disciplinaverticalizada'
ORDER BY ordinal_position;