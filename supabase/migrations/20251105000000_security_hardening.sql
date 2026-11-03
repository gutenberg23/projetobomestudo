-- =====================================================================
-- Hardening de segurança (auditoria 2026-11)
--
-- Corrige políticas RLS permissivas demais e funções RPC perigosas.
-- Idempotente: pode ser executada mais de uma vez.
-- Rode antes, se quiser, supabase/security/audit_checks.sql para ver o
-- estado atual do banco.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. PROFILES: impedir que o próprio usuário altere nível, role ou status
--    (ex.: um usuário bloqueado se desbloquear, ou alguém virar admin).
--    A policy "Usuários atualizam próprio perfil" permite UPDATE na
--    própria linha sem restringir colunas; quem protege é este trigger.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.uid() nulo = service role / SQL editor: permitido
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() AND (
       (to_jsonb(OLD) ->> 'role')   IS DISTINCT FROM (to_jsonb(NEW) ->> 'role')
    OR (to_jsonb(OLD) ->> 'nivel')  IS DISTINCT FROM (to_jsonb(NEW) ->> 'nivel')
    OR (to_jsonb(OLD) ->> 'status') IS DISTINCT FROM (to_jsonb(NEW) ->> 'status')
    OR OLD.id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar nível, papel ou status de usuários'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- ---------------------------------------------------------------------
-- 2. TEORIAS: a migration original permitia que QUALQUER usuário logado
--    criasse, editasse e apagasse qualquer teoria, e visse rascunhos.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as teorias" ON public.teorias;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir teorias" ON public.teorias;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar teorias" ON public.teorias;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar teorias" ON public.teorias;
DROP POLICY IF EXISTS "Staff vê todas as teorias" ON public.teorias;
DROP POLICY IF EXISTS "Staff gerencia teorias" ON public.teorias;

CREATE POLICY "Staff vê todas as teorias"
ON public.teorias FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
);

CREATE POLICY "Staff gerencia teorias"
ON public.teorias FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
)
WITH CHECK (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
);

-- ---------------------------------------------------------------------
-- 3. BLOG_POSTS: a edição era liberada para quem tivesse o mesmo "nome"
--    do autor. Como qualquer usuário pode mudar o próprio nome no perfil,
--    bastava copiar o nome de um autor para editar os posts dele.
--    Agora exige também o papel de jornalista.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Autor ou admin edita posts" ON public.blog_posts;
CREATE POLICY "Autor ou admin edita posts" ON public.blog_posts
FOR UPDATE TO authenticated
USING (
  public.is_admin()
  OR (
    public.has_role(auth.uid(), 'jornalista')
    AND author = (SELECT nome FROM public.profiles WHERE id = auth.uid())
  )
)
WITH CHECK (
  public.is_admin()
  OR (
    public.has_role(auth.uid(), 'jornalista')
    AND author = (SELECT nome FROM public.profiles WHERE id = auth.uid())
  )
);

-- ---------------------------------------------------------------------
-- 4. FILES: qualquer usuário logado podia ler/alterar/apagar todos os
--    registros. Restringe ao staff (gerenciador de arquivos do admin).
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.files') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Usuários autenticados gerenciam arquivos" ON public.files';
    EXECUTE 'DROP POLICY IF EXISTS "Staff gerencia arquivos" ON public.files';
    EXECUTE $p$
      CREATE POLICY "Staff gerencia arquivos" ON public.files
      FOR ALL TO authenticated
      USING (public.is_admin() OR public.has_role(auth.uid(), 'professor')
             OR public.has_role(auth.uid(), 'assistente') OR public.has_role(auth.uid(), 'jornalista'))
      WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'professor')
             OR public.has_role(auth.uid(), 'assistente') OR public.has_role(auth.uid(), 'jornalista'))
    $p$;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 5. STORAGE blog-pdfs: upload liberado para qualquer usuário logado.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir upload autenticado de PDFs" ON storage.objects;
CREATE POLICY "Permitir upload autenticado de PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-pdfs'
  AND (public.is_admin() OR public.has_role(auth.uid(), 'jornalista'))
);

-- ---------------------------------------------------------------------
-- 6. USER_QUESTION_ATTEMPTS: a RPC upsert_user_question_attempt é
--    SECURITY DEFINER e recebe p_user_id do cliente, ou seja, qualquer
--    pessoa podia gravar tentativas em nome de outro usuário (fraude no
--    ranking). O trigger abaixo bloqueia isso independentemente da
--    assinatura/corpo da função existente no banco.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_own_question_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NEW.user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Não é permitido registrar tentativas de outro usuário'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.user_question_attempts') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS enforce_own_question_attempt_trigger ON public.user_question_attempts';
    EXECUTE 'CREATE TRIGGER enforce_own_question_attempt_trigger
             BEFORE INSERT OR UPDATE ON public.user_question_attempts
             FOR EACH ROW EXECUTE FUNCTION public.enforce_own_question_attempt()';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 7. RPCs perigosas: execução de SQL arbitrário e "login de emergência"
--    chamáveis pelo navegador. Revoga EXECUTE de anon/authenticated
--    (continua disponível para service_role e no SQL Editor).
--    Também tira de anon as RPCs administrativas.
-- ---------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('exec_sql', 'execute_sql', 'admin_direct_login', 'admin_create_test_user')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.sig);
    RAISE NOTICE 'EXECUTE revogado de anon/authenticated: %', fn.sig;
  END LOOP;

  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND (p.proname LIKE 'admin\_%' OR p.proname IN ('clear_question_stats', 'clear_all_question_stats'))
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', fn.sig);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 8. Funções SECURITY DEFINER sem search_path fixo podem ser sequestradas
--    criando objetos com o mesmo nome em outro schema.
-- ---------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.proname IN ('table_exists', 'upsert_user_question_attempt', 'is_admin_or_staff',
                        'is_anuncio_ativo', 'get_anuncios_ativos_por_posicao',
                        'get_anuncio_ativo_por_posicao', 'handle_new_user')
      AND NOT EXISTS (
        SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search_path=%'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn.sig);
  END LOOP;
END $$;

COMMIT;
