-- Atualizar função de ranking de comentários para usar a tabela correta
-- Função para obter o ranking de comentários com as colunas corretas
CREATE OR REPLACE FUNCTION public.get_comment_ranking()
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    comment_count BIGINT,
    total_likes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH comment_stats AS (
        SELECT
            cq.usuario_id as user_id,
            COUNT(cq.id) AS comment_count,
            COUNT(DISTINCT lc.id) AS total_likes
        FROM
            public.comentarios_questoes cq
        LEFT JOIN
            public.likes_comentarios lc ON cq.id = lc.comentario_id
        GROUP BY
            cq.usuario_id
    )
    SELECT
        cs.user_id,
        p.nome AS display_name,
        p.foto_perfil AS avatar_url,
        cs.comment_count,
        cs.total_likes
    FROM
        comment_stats cs
    JOIN
        public.profiles p ON cs.user_id = p.id
    ORDER BY
        cs.total_likes DESC,
        cs.comment_count DESC;
END;
$$ LANGUAGE plpgsql; 