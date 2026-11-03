-- =====================================================================
-- Verificações de segurança (SOMENTE LEITURA)
-- Rode no SQL Editor do Supabase. Nenhuma consulta altera dados.
-- Cada bloco lista o que merece atenção; resultado vazio = tudo certo.
-- =====================================================================

-- 1) Tabelas do schema public SEM RLS habilitado.
--    Com a anon key (que é pública) qualquer pessoa lê/escreve nelas.
SELECT c.relname AS tabela_sem_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
ORDER BY 1;

-- 2) Policies de escrita "abertas" (USING/WITH CHECK = true) para anon,
--    authenticated ou public.
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  AND (coalesce(qual, '') IN ('true', '') AND coalesce(with_check, 'true') = 'true')
ORDER BY tablename, policyname;

-- 3) Funções SECURITY DEFINER que anon/authenticated podem executar.
--    Revise o corpo de cada uma: se ela recebe user_id como parâmetro ou
--    executa SQL dinâmico sem checar is_admin(), é uma brecha.
SELECT p.oid::regprocedure AS funcao,
       has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_executa,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS logado_executa,
       (SELECT string_agg(c, ', ') FROM unnest(coalesce(p.proconfig, '{}')) c) AS config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef
ORDER BY 1;

-- 4) Funções que executam SQL dinâmico (EXECUTE) e quem pode chamá-las.
SELECT p.oid::regprocedure AS funcao,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS logado_executa
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosrc ~* '\mexecute\M'
ORDER BY 1;

-- 5) Quem tem papel de staff hoje (confira se todos deveriam ter).
SELECT ur.role, p.email, p.nome, ur.user_id
FROM public.user_roles ur
LEFT JOIN public.profiles p ON p.id = ur.user_id
WHERE ur.role IN ('admin', 'professor', 'assistente', 'jornalista')
ORDER BY ur.role, p.email;

-- 6) Contas de teste/emergência conhecidas que estavam no código-fonte.
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email IN ('admin@bomestudo.com.br', 'teste@bomestudo.com.br');

-- 7) Buckets públicos do Storage.
SELECT id, name, public FROM storage.buckets ORDER BY id;

-- 8) Triggers de proteção esperados (devem aparecer 2 linhas).
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname IN ('prevent_role_escalation_trigger', 'enforce_own_question_attempt_trigger');
