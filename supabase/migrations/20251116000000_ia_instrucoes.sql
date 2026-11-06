-- =====================================================================
-- Instruções da IA editáveis pelo painel (/admin/posts > Feeds RSS >
-- Instruções da IA).
--
-- Uma linha por tipo de instrução. Hoje existe só 'noticias_rss', usada
-- pelas Edge Functions rss-auto-sync e rewrite-content ao reescrever
-- notícias para o blog. A coluna config guarda só o que foi alterado;
-- campo ausente ou vazio = texto padrão definido no código.
--
-- Pode ser rodada mais de uma vez sem problema.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.ia_instrucoes (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS ia_instrucoes_updated_at ON public.ia_instrucoes;
CREATE TRIGGER ia_instrucoes_updated_at
    BEFORE UPDATE ON public.ia_instrucoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.ia_instrucoes ENABLE ROW LEVEL SECURITY;

-- Mesmo público do painel de RSS: administradores e jornalistas.
-- As Edge Functions leem com a service role (ignora a RLS).
DROP POLICY IF EXISTS "Blog gerencia instruções da IA" ON public.ia_instrucoes;
CREATE POLICY "Blog gerencia instruções da IA"
ON public.ia_instrucoes FOR ALL
TO authenticated
USING (public.is_admin() OR public.has_role(auth.uid(), 'jornalista'))
WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'jornalista'));

INSERT INTO public.ia_instrucoes (id, config)
VALUES ('noticias_rss', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
