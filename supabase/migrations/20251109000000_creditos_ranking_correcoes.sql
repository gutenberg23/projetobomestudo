-- =====================================================================
-- Créditos e ranking das correções de teorias
-- =====================================================================
-- Funções públicas e somente leitura. Expõem apenas nome de exibição e
-- foto dos autores de correções APROVADAS (nunca e-mail ou outros dados).
-- Depende de 20251108000000_topicos_teoria_e_correcoes.sql.

CREATE INDEX IF NOT EXISTS teoria_correcoes_aprovadas_idx
    ON public.teoria_correcoes (teoria_id, autor_id)
    WHERE status = 'aprovado';

CREATE OR REPLACE FUNCTION public._nome_publico(p public.profiles)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT coalesce(
        nullif(btrim(p.nome_social), ''),
        nullif(btrim(concat_ws(' ', p.nome, p.sobrenome)), ''),
        'Usuário'
    );
$$;

REVOKE ALL ON FUNCTION public._nome_publico(public.profiles) FROM PUBLIC, anon, authenticated;

-- Quem contribuiu com uma teoria (para os créditos no fim da página)
CREATE OR REPLACE FUNCTION public.contribuidores_teoria(p_teoria_id UUID)
RETURNS TABLE (nome TEXT, total_correcoes INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public._nome_publico(p), count(*)::int
    FROM public.teoria_correcoes c
    JOIN public.teorias t ON t.id = c.teoria_id AND t.status = 'published'
    JOIN public.profiles p ON p.id = c.autor_id
    WHERE c.teoria_id = p_teoria_id
      AND c.status = 'aprovado'
    GROUP BY p.id
    ORDER BY count(*) DESC, min(c.revisado_em)
    LIMIT 100;
$$;

-- Ranking geral de contribuições em teorias
CREATE OR REPLACE FUNCTION public.ranking_contribuicoes_teorias(p_limite INTEGER DEFAULT 100)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    total_correcoes INTEGER,
    total_teorias INTEGER,
    ultima_contribuicao TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id,
           public._nome_publico(p),
           coalesce(nullif(p.foto_perfil, ''), nullif(p.foto_url, '')),
           count(*)::int,
           count(DISTINCT c.teoria_id)::int,
           max(c.revisado_em)
    FROM public.teoria_correcoes c
    JOIN public.profiles p ON p.id = c.autor_id
    WHERE c.status = 'aprovado'
    GROUP BY p.id
    ORDER BY count(*) DESC, count(DISTINCT c.teoria_id) DESC, max(c.revisado_em) ASC
    LIMIT least(greatest(coalesce(p_limite, 100), 1), 500);
$$;

REVOKE ALL ON FUNCTION public.contribuidores_teoria(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ranking_contribuicoes_teorias(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contribuidores_teoria(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ranking_contribuicoes_teorias(INTEGER) TO anon, authenticated;
