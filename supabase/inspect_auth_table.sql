-- Script para inspecionar a estrutura das tabelas relacionadas à autenticação
-- Use este script para entender a estrutura atual do banco e diagnosticar problemas

-- 1. Verificar estrutura da tabela auth.users
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY 
  ordinal_position;

-- 2. Verificar schemas e tabelas existentes relacionadas a autenticação
SELECT 
  table_schema, 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'auth' 
ORDER BY 
  table_schema, 
  table_name;

-- 3. Verificar restrições de chave estrangeira na tabela profiles
SELECT
  tc.constraint_name,
  tc.table_name as constrained_table,
  kcu.column_name as constrained_column,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
FROM
  information_schema.table_constraints tc
JOIN
  information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN
  information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profiles';

-- 4. Verificar integridade de dados entre auth.users e public.profiles
DO $$
DECLARE
  v_user_count INTEGER;
  v_profile_count INTEGER;
  v_orphaned_profiles INTEGER;
  v_users_without_profiles INTEGER;
BEGIN
  -- Contar usuários no auth.users
  SELECT COUNT(*) INTO v_user_count FROM auth.users;
  
  -- Contar perfis no public.profiles
  SELECT COUNT(*) INTO v_profile_count FROM public.profiles;
  
  -- Contar perfis sem usuário correspondente
  SELECT COUNT(*) INTO v_orphaned_profiles
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE u.id IS NULL;
  
  -- Contar usuários sem perfil
  SELECT COUNT(*) INTO v_users_without_profiles
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  -- Apresentar resultados
  RAISE NOTICE 'Contagem de usuários em auth.users: %', v_user_count;
  RAISE NOTICE 'Contagem de perfis em public.profiles: %', v_profile_count;
  RAISE NOTICE 'Perfis órfãos (sem usuário correspondente): %', v_orphaned_profiles;
  RAISE NOTICE 'Usuários sem perfil: %', v_users_without_profiles;
END $$;

-- 5. Verificar um exemplo de usuário (se houver)
SELECT 
  id, 
  email, 
  role, 
  email_confirmed_at
FROM 
  auth.users 
LIMIT 1;

-- 6. Verificar políticas RLS atuais na tabela profiles
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual
FROM 
  pg_policies
WHERE 
  tablename = 'profiles';

-- 7. Verificar se existe a função log_login_attempt
SELECT 
  routine_schema, 
  routine_name, 
  data_type AS return_type
FROM 
  information_schema.routines
WHERE 
  routine_name = 'log_login_attempt';

-- 8. Verificar se existe a tabela login_attempts
SELECT 
  EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'login_attempts'
  ); 