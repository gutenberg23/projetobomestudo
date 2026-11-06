-- =====================================================================
-- Disciplinas formadas por teorias (no lugar de aulas > tópicos)
--
-- 1. disciplinas.teorias_ids: teorias da disciplina, na ordem do admin.
-- 2. cursos.teorias_por_disciplina: { "<disciplina_id>": ["<teoria_id>", ...] }
--    Quais teorias de cada disciplina entram no curso. Sem chave = todas.
-- 3. public.teorias_progresso: teoria concluída pelo aluno. Vale em todos
--    os cursos que usam a teoria.
-- 4. flashcards.teoria_id: o cartão passa a pertencer a uma teoria
--    (topico_id continua existindo para os cartões antigos).
-- 5. Conversão do conteúdo atual: as teorias ligadas aos tópicos das aulas
--    entram na disciplina, na ordem aula > tópico; flashcards e tópicos
--    concluídos são levados para a teoria do tópico.
-- 6. unificar_disciplinas também junta as teorias.
--
-- Não apaga nada: aulas, tópicos e o progresso antigo continuam no banco.
-- O edital verticalizado não é tocado. Pode ser rodada mais de uma vez.
-- =====================================================================

ALTER TABLE public.disciplinas
    ADD COLUMN IF NOT EXISTS teorias_ids TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.cursos
    ADD COLUMN IF NOT EXISTS teorias_por_disciplina JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ---------------------------------------------------------------------
-- Progresso por teoria
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teorias_progresso (
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    teoria_id UUID NOT NULL REFERENCES public.teorias(id) ON DELETE CASCADE,
    concluida_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, teoria_id)
);

CREATE INDEX IF NOT EXISTS teorias_progresso_teoria_idx ON public.teorias_progresso (teoria_id);

ALTER TABLE public.teorias_progresso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aluno vê o próprio progresso de teorias" ON public.teorias_progresso;
CREATE POLICY "Aluno vê o próprio progresso de teorias"
ON public.teorias_progresso FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno marca as próprias teorias" ON public.teorias_progresso;
CREATE POLICY "Aluno marca as próprias teorias"
ON public.teorias_progresso FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno desmarca as próprias teorias" ON public.teorias_progresso;
CREATE POLICY "Aluno desmarca as próprias teorias"
ON public.teorias_progresso FOR DELETE
TO authenticated
USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.teorias_progresso TO authenticated;

-- ---------------------------------------------------------------------
-- Flashcards por teoria
-- ---------------------------------------------------------------------
ALTER TABLE public.flashcards
    ADD COLUMN IF NOT EXISTS teoria_id UUID REFERENCES public.teorias(id) ON DELETE CASCADE;

ALTER TABLE public.flashcards ALTER COLUMN topico_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS flashcards_teoria_idx ON public.flashcards (teoria_id, ordem, created_at);

-- Cartões antigos: a teoria do tópico
UPDATE public.flashcards f
SET teoria_id = t.teoria_id::uuid
FROM public.topicos t
WHERE f.topico_id = t.id
  AND f.teoria_id IS NULL
  AND t.teoria_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.teorias te WHERE te.id::text = t.teoria_id::text);

ALTER TABLE public.flashcards DROP CONSTRAINT IF EXISTS flashcards_dono_check;
ALTER TABLE public.flashcards
    ADD CONSTRAINT flashcards_dono_check CHECK (teoria_id IS NOT NULL OR topico_id IS NOT NULL);

-- ---------------------------------------------------------------------
-- Conversão: teorias dos tópicos das aulas entram na disciplina
-- (só em disciplinas que ainda não têm teorias escolhidas)
-- ---------------------------------------------------------------------
UPDATE public.disciplinas d
SET teorias_ids = x.ids
FROM (
    SELECT d2.id,
           ARRAY(
               SELECT s.teoria
               FROM (
                   SELECT tp.teoria_id::text AS teoria, min(ao.o * 100000 + tpo.o) AS ordem
                   FROM unnest(coalesce(d2.aulas_ids, '{}')) WITH ORDINALITY ao(aula, o)
                   JOIN public.aulas a ON a.id::text = ao.aula
                   CROSS JOIN LATERAL unnest(coalesce(a.topicos_ids::text[], '{}')) WITH ORDINALITY tpo(topico, o)
                   JOIN public.topicos tp ON tp.id::text = tpo.topico
                   JOIN public.teorias te ON te.id::text = tp.teoria_id::text
                   WHERE tp.teoria_id IS NOT NULL
                   GROUP BY tp.teoria_id::text
               ) s
               ORDER BY s.ordem
           ) AS ids
    FROM public.disciplinas d2
) x
WHERE d.id = x.id
  AND coalesce(array_length(d.teorias_ids, 1), 0) = 0
  AND coalesce(array_length(x.ids, 1), 0) > 0;

-- Tópicos já concluídos viram teorias concluídas
INSERT INTO public.teorias_progresso (user_id, teoria_id, concluida_em)
SELECT DISTINCT ON (p.user_id, te.id) p.user_id, te.id, coalesce(p.updated_at, now())
FROM public.user_course_progress p
CROSS JOIN LATERAL jsonb_each(
    CASE WHEN jsonb_typeof(p.subjects_data -> 'completed_sections') = 'object'
         THEN p.subjects_data -> 'completed_sections' ELSE '{}'::jsonb END
) cs(aula, topicos)
CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE WHEN jsonb_typeof(cs.topicos) = 'array' THEN cs.topicos ELSE '[]'::jsonb END
) tid(topico)
JOIN public.topicos tp ON tp.id::text = tid.topico
JOIN public.teorias te ON te.id::text = tp.teoria_id::text
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id, teoria_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- Unificar disciplinas: junta também as teorias
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unificar_disciplinas(
    p_principal TEXT,
    p_repetidas TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rep TEXT[];
    v_todas TEXT[];
    v_aulas_principal TEXT[];
    v_aulas TEXT[];
    v_aulas_d TEXT[];
    v_aulas_por_disc JSONB := '{}'::jsonb;
    v_teorias_principal TEXT[];
    v_teorias TEXT[];
    v_teorias_d TEXT[];
    v_teorias_por_disc JSONB := '{}'::jsonb;
    v_d TEXT;
    c RECORD;
    v_novo TEXT[];
    v_sel JSONB;
    v_sel_t JSONB;
    v_acc TEXT[];
    v_acc_t TEXT[];
    v_entrada TEXT[];
    v_cursos INTEGER := 0;
    v_ciclos INTEGER := 0;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem unificar disciplinas';
    END IF;

    v_rep := ARRAY(
        SELECT DISTINCT x FROM unnest(coalesce(p_repetidas, '{}')) x
        WHERE x IS NOT NULL AND x <> '' AND x <> p_principal
    );
    IF coalesce(array_length(v_rep, 1), 0) = 0 THEN
        RAISE EXCEPTION 'Escolha ao menos uma disciplina para unificar na principal';
    END IF;

    SELECT coalesce(aulas_ids::text[], '{}'), coalesce(teorias_ids, '{}')
    INTO v_aulas_principal, v_teorias_principal
    FROM public.disciplinas
    WHERE id::text = p_principal AND unificada_em IS NULL
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Disciplina principal não encontrada (ou já unificada em outra)';
    END IF;

    IF (SELECT count(*) FROM public.disciplinas WHERE id::text = ANY (v_rep) AND unificada_em IS NULL) <> array_length(v_rep, 1) THEN
        RAISE EXCEPTION 'Alguma das disciplinas escolhidas não existe ou já foi unificada';
    END IF;

    v_todas := v_rep || p_principal;
    v_aulas_por_disc := jsonb_build_object(p_principal, to_jsonb(v_aulas_principal));
    v_teorias_por_disc := jsonb_build_object(p_principal, to_jsonb(v_teorias_principal));

    -- 1. A principal recebe as aulas e as teorias das repetidas (sem repetir)
    v_aulas := public._uniao_ordenada('{}', v_aulas_principal);
    v_teorias := public._uniao_ordenada('{}', v_teorias_principal);
    FOREACH v_d IN ARRAY v_rep LOOP
        SELECT coalesce(aulas_ids::text[], '{}'), coalesce(teorias_ids, '{}')
        INTO v_aulas_d, v_teorias_d
        FROM public.disciplinas WHERE id::text = v_d FOR UPDATE;
        v_aulas_por_disc := v_aulas_por_disc || jsonb_build_object(v_d, to_jsonb(v_aulas_d));
        v_teorias_por_disc := v_teorias_por_disc || jsonb_build_object(v_d, to_jsonb(v_teorias_d));
        v_aulas := public._uniao_ordenada(v_aulas, v_aulas_d);
        v_teorias := public._uniao_ordenada(v_teorias, v_teorias_d);
    END LOOP;

    UPDATE public.disciplinas
    SET aulas_ids = (SELECT r.aulas_ids FROM jsonb_populate_record(NULL::public.disciplinas,
                         jsonb_build_object('aulas_ids', to_jsonb(v_aulas))) r),
        teorias_ids = v_teorias
    WHERE id::text = p_principal;

    -- 2. Cursos: troca a repetida pela principal na mesma posição e grava o que o curso já mostrava
    FOR c IN
        SELECT id,
               coalesce(disciplinas_ids::text[], '{}') AS ids,
               coalesce(aulas_por_disciplina, '{}'::jsonb) AS sel,
               coalesce(teorias_por_disciplina, '{}'::jsonb) AS sel_t
        FROM public.cursos
        WHERE coalesce(disciplinas_ids::text[], '{}') && v_todas
        FOR UPDATE
    LOOP
        v_novo := '{}';
        v_sel := c.sel;
        v_sel_t := c.sel_t;
        v_acc := '{}';
        v_acc_t := '{}';
        FOREACH v_d IN ARRAY c.ids LOOP
            IF v_d = ANY (v_todas) THEN
                IF jsonb_typeof(v_sel -> v_d) = 'array' THEN
                    v_entrada := ARRAY(SELECT jsonb_array_elements_text(v_sel -> v_d));
                ELSE
                    v_entrada := ARRAY(SELECT jsonb_array_elements_text(v_aulas_por_disc -> v_d));
                END IF;
                v_acc := public._uniao_ordenada(v_acc, v_entrada);
                IF jsonb_typeof(v_sel_t -> v_d) = 'array' THEN
                    v_entrada := ARRAY(SELECT jsonb_array_elements_text(v_sel_t -> v_d));
                ELSE
                    v_entrada := ARRAY(SELECT jsonb_array_elements_text(v_teorias_por_disc -> v_d));
                END IF;
                v_acc_t := public._uniao_ordenada(v_acc_t, v_entrada);
                v_sel := v_sel - v_d;
                v_sel_t := v_sel_t - v_d;
                IF NOT (p_principal = ANY (v_novo)) THEN
                    v_novo := v_novo || p_principal;
                END IF;
            ELSIF NOT (v_d = ANY (v_novo)) THEN
                v_novo := v_novo || v_d;
            END IF;
        END LOOP;

        v_acc := ARRAY(SELECT a FROM unnest(v_aulas) WITH ORDINALITY t(a, o) WHERE a = ANY (v_acc) ORDER BY o);
        v_acc_t := ARRAY(SELECT a FROM unnest(v_teorias) WITH ORDINALITY t(a, o) WHERE a = ANY (v_acc_t) ORDER BY o);
        v_sel := v_sel || jsonb_build_object(p_principal, to_jsonb(v_acc));
        v_sel_t := v_sel_t || jsonb_build_object(p_principal, to_jsonb(v_acc_t));

        UPDATE public.cursos
        SET disciplinas_ids = (SELECT r.disciplinas_ids FROM jsonb_populate_record(NULL::public.cursos,
                                   jsonb_build_object('disciplinas_ids', to_jsonb(v_novo))) r),
            aulas_por_disciplina = v_sel,
            teorias_por_disciplina = v_sel_t
        WHERE id = c.id;
        v_cursos := v_cursos + 1;
    END LOOP;

    -- 3. Ciclo de estudos dos alunos: a disciplina continua no mesmo lugar e com o mesmo tempo
    UPDATE public.ciclos_estudo ce
    SET disciplinas = (
        SELECT coalesce(jsonb_agg(x.e ORDER BY x.o), '[]'::jsonb)
        FROM (
            SELECT DISTINCT ON (CASE WHEN el ->> 'id' = ANY (v_rep) THEN p_principal ELSE coalesce(el ->> 'id', o::text) END)
                CASE WHEN el ->> 'id' = ANY (v_rep) THEN jsonb_set(el, '{id}', to_jsonb(p_principal)) ELSE el END AS e,
                o
            FROM jsonb_array_elements(ce.disciplinas) WITH ORDINALITY t(el, o)
            ORDER BY CASE WHEN el ->> 'id' = ANY (v_rep) THEN p_principal ELSE coalesce(el ->> 'id', o::text) END, o
        ) x
    )
    WHERE jsonb_typeof(ce.disciplinas) = 'array'
      AND EXISTS (SELECT 1 FROM jsonb_array_elements(ce.disciplinas) el WHERE el ->> 'id' = ANY (v_rep));
    GET DIAGNOSTICS v_ciclos = ROW_COUNT;

    -- 4. Marca as repetidas (e o que já tinha sido unificado nelas) como unificadas na principal
    UPDATE public.disciplinas
    SET unificada_em = p_principal
    WHERE id::text = ANY (v_rep) OR unificada_em = ANY (v_rep);

    RETURN jsonb_build_object(
        'aulas', coalesce(array_length(v_aulas, 1), 0),
        'teorias', coalesce(array_length(v_teorias, 1), 0),
        'cursos', v_cursos,
        'ciclos', v_ciclos,
        'unificadas', array_length(v_rep, 1)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.unificar_disciplinas(TEXT, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unificar_disciplinas(TEXT, TEXT[]) TO authenticated;

NOTIFY pgrst, 'reload schema';
