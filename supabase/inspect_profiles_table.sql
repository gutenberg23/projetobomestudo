-- Script para examinar a estrutura exata da tabela profiles

-- Listar todas as colunas na tabela profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY 
  ordinal_position;

-- Tentar selecionar um registro (se existir)
SELECT * FROM public.profiles LIMIT 1; 