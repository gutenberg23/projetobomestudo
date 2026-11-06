-- =====================================================================
-- Relevância da disciplina por curso
--
-- Antes a nota de 1 a 10 ficava na disciplina (disciplinas.descricao) e valia
-- para todos os cursos. Agora cada curso dá a sua nota a cada disciplina:
--   cursos.relevancia_por_disciplina = { "<disciplinaId>": 1..10 }
-- Disciplina sem nota no curso: não mostra relevância.
--
-- 1. Cria a coluna.
-- 2. Copia a nota atual da disciplina para todos os cursos que a usam
--    (sem sobrescrever notas já dadas no curso).
-- 3. unificar_disciplinas passa a levar a nota para a disciplina principal.
--
-- disciplinas.descricao não é apagada. Pode ser rodada mais de uma vez.
-- =====================================================================

ALTER TABLE public.cursos
    ADD COLUMN IF NOT EXISTS relevancia_por_disciplina JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.cursos c
SET relevancia_por_disciplina = x.notas || c.relevancia_por_disciplina
FROM (
    SELECT c2.id, jsonb_object_agg(d.id::text, trim(d.descricao)::int) AS notas
    FROM public.cursos c2
    JOIN public.disciplinas d ON d.id::text = ANY (coalesce(c2.disciplinas_ids::text[], '{}'))
    WHERE trim(coalesce(d.descricao, '')) ~ '^([1-9]|10)$'
    GROUP BY c2.id
) x
WHERE x.id = c.id;

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

    -- 1b. Relevância nos cursos: a principal fica com a maior nota entre as unificadas
    UPDATE public.cursos cu
    SET relevancia_por_disciplina = (cu.relevancia_por_disciplina - v_rep) || jsonb_build_object(
            p_principal,
            (SELECT max((cu.relevancia_por_disciplina ->> k)::int) FROM unnest(v_todas) k
             WHERE (cu.relevancia_por_disciplina ->> k) ~ '^[0-9]+$'))
    WHERE cu.relevancia_por_disciplina ?| v_todas
      AND EXISTS (SELECT 1 FROM unnest(v_todas) k WHERE (cu.relevancia_por_disciplina ->> k) ~ '^[0-9]+$');

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
