-- =====================================================================
-- Links amigáveis para as teorias
--
-- Antes, a URL de uma teoria era /teoria/<uuid>. Agora cada teoria tem um
-- `slug` único gerado a partir do título (/teoria/direito-constitucional-...).
--
-- * Links antigos por id continuam funcionando: a página busca pelo id e
--   redireciona para o slug.
-- * Se o slug de uma teoria mudar, o slug antigo fica guardado em
--   `teorias_slugs_antigos` e também redireciona para o novo.
-- * O slug só muda quando alguém o edita no admin (ou apaga o campo, o que
--   gera de novo a partir do título). Mudar só o título não quebra links.
-- =====================================================================

-- 1. Converte um texto em slug (sem depender da extensão unaccent)
CREATE OR REPLACE FUNCTION public.slugify(p_texto text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT left(
    trim(BOTH '-' FROM
      regexp_replace(
        translate(
          lower(coalesce(p_texto, '')),
          'áàâãäåāéèêëēíìîïīóòôõöøōúùûüūçñýÿ',
          'aaaaaaaeeeeeiiiiiooooooouuuuucnyy'
        ),
        '[^a-z0-9]+', '-', 'g'
      )
    ),
    120
  );
$$;

-- 2. Coluna e histórico de slugs antigos
ALTER TABLE public.teorias ADD COLUMN IF NOT EXISTS slug text;

CREATE TABLE IF NOT EXISTS public.teorias_slugs_antigos (
  slug text PRIMARY KEY,
  teoria_id uuid NOT NULL REFERENCES public.teorias(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS teorias_slugs_antigos_teoria_idx
  ON public.teorias_slugs_antigos (teoria_id);

ALTER TABLE public.teorias_slugs_antigos ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode resolver um slug antigo (só aponta para o id;
-- o conteúdo continua protegido pelas políticas da tabela teorias).
DROP POLICY IF EXISTS "Todos leem slugs antigos de teorias" ON public.teorias_slugs_antigos;
CREATE POLICY "Todos leem slugs antigos de teorias"
ON public.teorias_slugs_antigos FOR SELECT
TO anon, authenticated
USING (true);
-- Sem políticas de escrita: só o gatilho abaixo (SECURITY DEFINER) grava.

-- 3. Gatilho: gera/normaliza o slug e garante que seja único
CREATE OR REPLACE FUNCTION public.teorias_definir_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base text;
  v_slug text;
  v_n int := 1;
BEGIN
  -- Em UPDATE sem mudança no slug, não faz nada
  IF TG_OP = 'UPDATE' AND NEW.slug IS NOT DISTINCT FROM OLD.slug THEN
    RETURN NEW;
  END IF;

  v_base := public.slugify(NULLIF(trim(coalesce(NEW.slug, '')), ''));
  IF v_base IS NULL OR v_base = '' THEN
    v_base := public.slugify(NEW.titulo);
  END IF;
  IF v_base IS NULL OR v_base = '' THEN
    v_base := 'teoria';
  END IF;

  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM public.teorias t WHERE t.slug = v_slug AND t.id IS DISTINCT FROM NEW.id)
     OR EXISTS (SELECT 1 FROM public.teorias_slugs_antigos s WHERE s.slug = v_slug AND s.teoria_id IS DISTINCT FROM NEW.id)
  LOOP
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  END LOOP;

  NEW.slug := v_slug;

  IF TG_OP = 'UPDATE' AND OLD.slug IS NOT NULL AND OLD.slug <> NEW.slug THEN
    -- Guarda o slug antigo para redirecionar
    INSERT INTO public.teorias_slugs_antigos (slug, teoria_id)
    VALUES (OLD.slug, NEW.id)
    ON CONFLICT (slug) DO UPDATE SET teoria_id = EXCLUDED.teoria_id;
    -- Se a teoria voltou a usar um slug que já foi dela, tira do histórico
    DELETE FROM public.teorias_slugs_antigos WHERE slug = NEW.slug;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS teorias_definir_slug_trigger ON public.teorias;
CREATE TRIGGER teorias_definir_slug_trigger
  BEFORE INSERT OR UPDATE OF slug ON public.teorias
  FOR EACH ROW
  EXECUTE FUNCTION public.teorias_definir_slug();

-- 4. Preenche o slug das teorias existentes (as mais antigas ficam com o
--    slug "limpo"; repetidos ganham -2, -3...)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.teorias WHERE slug IS NULL ORDER BY created_at, id LOOP
    -- '' força o gatilho a rodar (NULL -> '') e gerar a partir do título
    UPDATE public.teorias SET slug = '' WHERE id = r.id;
  END LOOP;
END;
$$;

ALTER TABLE public.teorias ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS teorias_slug_key ON public.teorias (slug);
