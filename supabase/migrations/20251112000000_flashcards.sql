-- =====================================================================
-- Flashcards
--
-- * Cada flashcard pertence a um tópico (public.topicos).
-- * cursos_ids define em quais cursos ele aparece. Lista vazia = aparece
--   em todos os cursos que usam o tópico. Com cursos escolhidos, aparece
--   só neles (e só se o curso tiver o tópico).
-- * public.flashcards_progresso guarda, por aluno, se ele lembrou ou não
--   de cada cartão na última revisão.
--
-- Pode ser rodada mais de uma vez sem problema.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    topico_id UUID NOT NULL REFERENCES public.topicos(id) ON DELETE CASCADE,
    frente TEXT NOT NULL CHECK (char_length(btrim(frente)) BETWEEN 1 AND 10000),
    verso TEXT NOT NULL CHECK (char_length(btrim(verso)) BETWEEN 1 AND 20000),
    tags TEXT[] NOT NULL DEFAULT '{}',
    cursos_ids TEXT[] NOT NULL DEFAULT '{}',
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_por UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS flashcards_topico_idx ON public.flashcards (topico_id, ordem, created_at);
CREATE INDEX IF NOT EXISTS flashcards_cursos_idx ON public.flashcards USING GIN (cursos_ids);

DROP TRIGGER IF EXISTS flashcards_updated_at ON public.flashcards;
CREATE TRIGGER flashcards_updated_at
    BEFORE UPDATE ON public.flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de flashcards" ON public.flashcards;
CREATE POLICY "Leitura pública de flashcards"
ON public.flashcards FOR SELECT
TO public
USING (true);

-- Mesma regra dos tópicos: administradores e professores gerenciam
DROP POLICY IF EXISTS "Staff gerencia flashcards" ON public.flashcards;
CREATE POLICY "Staff gerencia flashcards"
ON public.flashcards FOR ALL
TO authenticated
USING (public.is_admin() OR public.has_role(auth.uid(), 'professor'))
WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'professor'));

-- ---------------------------------------------------------------------
-- Progresso do aluno
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.flashcards_progresso (
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    acertos INTEGER NOT NULL DEFAULT 0 CHECK (acertos >= 0),
    erros INTEGER NOT NULL DEFAULT 0 CHECK (erros >= 0),
    ultimo TEXT NOT NULL CHECK (ultimo IN ('lembrei', 'esqueci')),
    revisado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, flashcard_id)
);

CREATE INDEX IF NOT EXISTS flashcards_progresso_card_idx ON public.flashcards_progresso (flashcard_id);

ALTER TABLE public.flashcards_progresso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aluno vê o próprio progresso de flashcards" ON public.flashcards_progresso;
CREATE POLICY "Aluno vê o próprio progresso de flashcards"
ON public.flashcards_progresso FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno grava o próprio progresso de flashcards" ON public.flashcards_progresso;
CREATE POLICY "Aluno grava o próprio progresso de flashcards"
ON public.flashcards_progresso FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno atualiza o próprio progresso de flashcards" ON public.flashcards_progresso;
CREATE POLICY "Aluno atualiza o próprio progresso de flashcards"
ON public.flashcards_progresso FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno apaga o próprio progresso de flashcards" ON public.flashcards_progresso;
CREATE POLICY "Aluno apaga o próprio progresso de flashcards"
ON public.flashcards_progresso FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Registra uma revisão somando ao contador (evita ler antes de gravar)
CREATE OR REPLACE FUNCTION public.registrar_revisao_flashcard(p_flashcard_id UUID, p_lembrei BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Entre na sua conta para salvar o progresso';
    END IF;
    INSERT INTO public.flashcards_progresso (user_id, flashcard_id, acertos, erros, ultimo, revisado_em)
    VALUES (
        auth.uid(),
        p_flashcard_id,
        CASE WHEN p_lembrei THEN 1 ELSE 0 END,
        CASE WHEN p_lembrei THEN 0 ELSE 1 END,
        CASE WHEN p_lembrei THEN 'lembrei' ELSE 'esqueci' END,
        now()
    )
    ON CONFLICT (user_id, flashcard_id) DO UPDATE SET
        acertos = public.flashcards_progresso.acertos + CASE WHEN p_lembrei THEN 1 ELSE 0 END,
        erros = public.flashcards_progresso.erros + CASE WHEN p_lembrei THEN 0 ELSE 1 END,
        ultimo = EXCLUDED.ultimo,
        revisado_em = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_revisao_flashcard(UUID, BOOLEAN) TO authenticated;
