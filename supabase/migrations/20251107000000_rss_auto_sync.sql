-- =====================================================================
-- Reescrita automática de notícias via RSS (Edge Function rss-auto-sync)
--
-- 1. Colunas novas em rss_configs e rss_transmitidos (status de cada item,
--    publicação automática por feed, último erro).
-- 2. RLS: só a equipe (admin, professor, assistente, jornalista) mexe nos
--    feeds. Como agora um feed pode publicar sozinho, deixar essas tabelas
--    abertas permitiria que qualquer pessoa cadastrasse um feed malicioso.
-- 3. Agendamento gratuito com pg_cron + pg_net, que chama a Edge Function a
--    cada 30 minutos. Só passa a funcionar depois de criar o segredo
--    'rss_cron_secret' no Vault (veja docs/rss-reescrita-automatica.md).
--
-- Idempotente: pode ser executada mais de uma vez.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rss_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rss_configs ADD COLUMN IF NOT EXISTS "lastSync" TIMESTAMPTZ;
ALTER TABLE public.rss_configs ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ;
ALTER TABLE public.rss_configs ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.rss_configs ADD COLUMN IF NOT EXISTS last_error TEXT;

CREATE TABLE IF NOT EXISTS public.rss_transmitidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rss_item_guid TEXT NOT NULL UNIQUE,
  rss_item_link TEXT NOT NULL,
  rss_feed_name TEXT NOT NULL,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- publicado | rascunho | erro
ALTER TABLE public.rss_transmitidos ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'rascunho';
ALTER TABLE public.rss_transmitidos ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE public.rss_transmitidos ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.rss_transmitidos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- O upsert da Edge Function usa rss_item_guid como chave.
CREATE UNIQUE INDEX IF NOT EXISTS rss_transmitidos_guid_unique ON public.rss_transmitidos (rss_item_guid);
CREATE INDEX IF NOT EXISTS idx_rss_transmitidos_link ON public.rss_transmitidos (rss_item_link);
CREATE INDEX IF NOT EXISTS idx_rss_transmitidos_status ON public.rss_transmitidos (status);

-- ---------------------------------------------------------------------
-- 2. RLS: remove políticas antigas (nomes desconhecidos, possivelmente
--    abertas) e cria uma única política para a equipe.
-- ---------------------------------------------------------------------
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('rss_configs', 'rss_transmitidos')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

ALTER TABLE public.rss_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_transmitidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe gerencia feeds RSS" ON public.rss_configs
FOR ALL TO authenticated
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
  OR public.has_role(auth.uid(), 'jornalista')
)
WITH CHECK (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
  OR public.has_role(auth.uid(), 'jornalista')
);

CREATE POLICY "Equipe gerencia itens RSS transmitidos" ON public.rss_transmitidos
FOR ALL TO authenticated
USING (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
  OR public.has_role(auth.uid(), 'jornalista')
)
WITH CHECK (
  public.is_admin()
  OR public.has_role(auth.uid(), 'professor')
  OR public.has_role(auth.uid(), 'assistente')
  OR public.has_role(auth.uid(), 'jornalista')
);

COMMIT;

-- ---------------------------------------------------------------------
-- 3. Agendamento (fora da transação: CREATE EXTENSION de pg_cron não
--    gosta de rodar junto com outras alterações em alguns ambientes)
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Chama a Edge Function. Lê o segredo do Vault, então nenhum segredo fica
-- gravado em código ou na definição do cron.
CREATE OR REPLACE FUNCTION public.invoke_rss_auto_sync()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_request_id BIGINT;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'rss_cron_secret'
  LIMIT 1;

  IF v_secret IS NULL OR length(v_secret) < 32 THEN
    RAISE NOTICE 'rss_cron_secret não configurado no Vault; sincronização ignorada';
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := 'https://ukkatmoathxhbaelstzo.supabase.co/functions/v1/rss-auto-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_secret
    ),
    body := jsonb_build_object('action', 'sync'),
    timeout_milliseconds := 150000
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.invoke_rss_auto_sync() FROM PUBLIC, anon, authenticated;

-- A cada 30 minutos. Para mudar: rode de novo com outro horário
-- (ex.: '0 * * * *' = de hora em hora). Para parar:
--   SELECT cron.unschedule('rss-auto-sync');
SELECT cron.schedule('rss-auto-sync', '*/30 * * * *', $$SELECT public.invoke_rss_auto_sync();$$);
