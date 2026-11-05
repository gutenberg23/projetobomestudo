-- =====================================================================
-- Disciplinas reaproveitáveis entre cursos
--
-- 1. cursos.aulas_por_disciplina: { "<disciplina_id>": ["<aula_id>", ...] }
--    Quais aulas de cada disciplina entram no curso. Disciplina sem chave
--    no mapa = todas as aulas dela (todos os cursos atuais continuam iguais).
-- 2. disciplinas.unificada_em: id da disciplina principal, quando esta foi
--    unificada em outra. Disciplinas unificadas somem das listagens, mas não
--    são apagadas (o link antigo mostra o conteúdo da principal).
-- 3. public.unificar_disciplinas(principal, repetidas[]): junta disciplinas
--    repetidas numa só, sem mudar o que o aluno vê em nenhum curso.
--
-- Não mexe em progresso: os tópicos concluídos são guardados por id da aula
-- (user_course_progress.subjects_data.completed_sections) e nenhuma aula
-- muda de id. O edital verticalizado (disciplinaverticalizada /
-- edital_verticalizado_data) é outra tabela e não é tocado.
-- =====================================================================

ALTER TABLE public.cursos
    ADD COLUMN IF NOT EXISTS aulas_por_disciplina JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.disciplinas
    ADD COLUMN IF NOT EXISTS unificada_em TEXT;

CREATE INDEX IF NOT EXISTS disciplinas_unificada_em_idx ON public.disciplinas (unificada_em);

-- Acrescenta a b só os itens que ainda não estão em a (mantém a ordem)
CREATE OR REPLACE FUNCTION public._uniao_ordenada(a TEXT[], b TEXT[])
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    r TEXT[] := coalesce(a, '{}');
    x TEXT;
BEGIN
    FOREACH x IN ARRAY coalesce(b, '{}') LOOP
        IF x IS NOT NULL AND x <> '' AND NOT (x = ANY (r)) THEN
            r := r || x;
        END IF;
    END LOOP;
    RETURN r;
END;
$$;

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
    v_d TEXT;
    c RECORD;
    v_ids TEXT[];
    v_novo TEXT[];
    v_sel JSONB;
    v_acc TEXT[];
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

    SELECT coalesce(aulas_ids::text[], '{}') INTO v_aulas_principal
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

    -- 1. A principal recebe as aulas das repetidas (primeiro as dela, depois as novas, sem repetir)
    v_aulas := public._uniao_ordenada('{}', v_aulas_principal);
    FOREACH v_d IN ARRAY v_rep LOOP
        SELECT coalesce(aulas_ids::text[], '{}') INTO v_aulas_d FROM public.disciplinas WHERE id::text = v_d FOR UPDATE;
        v_aulas_por_disc := v_aulas_por_disc || jsonb_build_object(v_d, to_jsonb(v_aulas_d));
        v_aulas := public._uniao_ordenada(v_aulas, v_aulas_d);
    END LOOP;

    UPDATE public.disciplinas
    SET aulas_ids = (SELECT r.aulas_ids FROM jsonb_populate_record(NULL::public.disciplinas,
                         jsonb_build_object('aulas_ids', to_jsonb(v_aulas))) r)
    WHERE id::text = p_principal;

    -- 2. Cursos: troca a repetida pela principal na mesma posição e grava as aulas que o curso
    --    já mostrava. Cursos que só tinham a principal também gravam as aulas de antes, para não
    --    ganharem de repente as aulas que vieram das repetidas.
    FOR c IN
        SELECT id, coalesce(disciplinas_ids::text[], '{}') AS ids, coalesce(aulas_por_disciplina, '{}'::jsonb) AS sel
        FROM public.cursos
        WHERE coalesce(disciplinas_ids::text[], '{}') && v_todas
        FOR UPDATE
    LOOP
        v_novo := '{}';
        v_sel := c.sel;
        v_acc := '{}';
        FOREACH v_d IN ARRAY c.ids LOOP
            IF v_d = ANY (v_todas) THEN
                IF jsonb_typeof(v_sel -> v_d) = 'array' THEN
                    v_entrada := ARRAY(SELECT jsonb_array_elements_text(v_sel -> v_d));
                ELSE
                    v_entrada := ARRAY(SELECT jsonb_array_elements_text(v_aulas_por_disc -> v_d));
                END IF;
                v_acc := public._uniao_ordenada(v_acc, v_entrada);
                v_sel := v_sel - v_d;
                IF NOT (p_principal = ANY (v_novo)) THEN
                    v_novo := v_novo || p_principal;
                END IF;
            ELSIF NOT (v_d = ANY (v_novo)) THEN
                v_novo := v_novo || v_d;
            END IF;
        END LOOP;

        -- Seleção na ordem das aulas da principal
        v_acc := ARRAY(SELECT a FROM unnest(v_aulas) WITH ORDINALITY t(a, o) WHERE a = ANY (v_acc) ORDER BY o);
        v_sel := v_sel || jsonb_build_object(p_principal, to_jsonb(v_acc));

        UPDATE public.cursos
        SET disciplinas_ids = (SELECT r.disciplinas_ids FROM jsonb_populate_record(NULL::public.cursos,
                                   jsonb_build_object('disciplinas_ids', to_jsonb(v_novo))) r),
            aulas_por_disciplina = v_sel
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
        'cursos', v_cursos,
        'ciclos', v_ciclos,
        'unificadas', array_length(v_rep, 1)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.unificar_disciplinas(TEXT, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unificar_disciplinas(TEXT, TEXT[]) TO authenticated;
