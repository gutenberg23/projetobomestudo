-- Criar função para obter o ranking de questões respondidas
CREATE OR REPLACE FUNCTION public.get_question_attempts_ranking()
RETURNS TABLE (
    ranking_position INTEGER,
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    total_attempts INTEGER,
    correct_answers INTEGER,
    wrong_answers INTEGER,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT
            uqa.user_id,
            COUNT(*)::INTEGER as total_attempts,
            SUM(CASE WHEN uqa.is_correct THEN 1 ELSE 0 END)::INTEGER as correct_answers,
            SUM(CASE WHEN NOT uqa.is_correct THEN 1 ELSE 0 END)::INTEGER as wrong_answers
        FROM
            public.user_question_attempts uqa
        GROUP BY
            uqa.user_id
    ),
    ranked_results AS (
        SELECT
            ROW_NUMBER() OVER (
                ORDER BY us.correct_answers DESC, 
                       us.total_attempts DESC, 
                       p.created_at ASC
            )::INTEGER as ranking_position,
            us.user_id,
            p.nome as display_name,
            p.foto_perfil as avatar_url,
            us.total_attempts,
            us.correct_answers,
            us.wrong_answers,
            CASE
                WHEN us.total_attempts > 0 THEN 
                    ROUND((us.correct_answers::NUMERIC / us.total_attempts) * 100, 2)
                ELSE 0
            END as success_rate
        FROM
            user_stats us
        JOIN
            public.profiles p ON us.user_id = p.id
        WHERE
            us.total_attempts > 0
    )
    SELECT * FROM ranked_results;
END;
$$ LANGUAGE plpgsql;

-- Remover a função check_table_exists existente antes de criar a nova versão
DROP FUNCTION IF EXISTS public.check_table_exists(text, text);

-- Criar função para verificar se uma tabela existe
CREATE OR REPLACE FUNCTION public.check_table_exists(
    table_name TEXT, 
    schema_name TEXT DEFAULT 'public'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables t
        WHERE t.table_schema = schema_name
        AND t.table_name = table_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Função atualizada que aceita um parâmetro de período
CREATE OR REPLACE FUNCTION public.get_question_attempts_ranking_by_period(period_filter TEXT)
RETURNS TABLE (
    ranking_position INTEGER,
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    total_attempts INTEGER,
    correct_answers INTEGER,
    wrong_answers INTEGER,
    success_rate NUMERIC
) AS $$
DECLARE
    start_date TIMESTAMP;
BEGIN
    -- Definir a data de início baseada no período
    IF period_filter = 'week' THEN
        start_date := (CURRENT_DATE - INTERVAL '7 days')::TIMESTAMP;
    ELSIF period_filter = 'month' THEN
        start_date := (CURRENT_DATE - INTERVAL '30 days')::TIMESTAMP;
    ELSE
        start_date := '1900-01-01'::TIMESTAMP; -- Data muito antiga para incluir tudo
    END IF;

    RETURN QUERY
    WITH user_stats AS (
        SELECT
            uqa.user_id,
            COUNT(*)::INTEGER as total_attempts,
            SUM(CASE WHEN uqa.is_correct THEN 1 ELSE 0 END)::INTEGER as correct_answers,
            SUM(CASE WHEN NOT uqa.is_correct THEN 1 ELSE 0 END)::INTEGER as wrong_answers
        FROM
            public.user_question_attempts uqa
        WHERE
            uqa.created_at >= start_date
        GROUP BY
            uqa.user_id
    ),
    ranked_results AS (
        SELECT
            ROW_NUMBER() OVER (
                ORDER BY us.correct_answers DESC, 
                       us.total_attempts DESC, 
                       p.created_at ASC
            )::INTEGER as ranking_position,
            us.user_id,
            p.nome as display_name,
            p.foto_perfil as avatar_url,
            us.total_attempts,
            us.correct_answers,
            us.wrong_answers,
            CASE
                WHEN us.total_attempts > 0 THEN 
                    ROUND((us.correct_answers::NUMERIC / us.total_attempts) * 100, 2)
                ELSE 0
            END as success_rate
        FROM
            user_stats us
        JOIN
            public.profiles p ON us.user_id = p.id
        WHERE
            us.total_attempts > 0
    )
    SELECT * FROM ranked_results;
END;
$$ LANGUAGE plpgsql;

-- Remover a política existente se ela existir
DROP POLICY IF EXISTS "Usuários autenticados podem ver o ranking de questões" ON public.user_question_attempts;

-- Políticas para visualização do ranking de questões
-- Todos os usuários autenticados podem ver o ranking
CREATE POLICY "Usuários autenticados podem ver o ranking de questões" 
ON public.user_question_attempts FOR SELECT
USING (auth.role() = 'authenticated'); 