-- Função para recalcular estatísticas de um caderno específico
CREATE OR REPLACE FUNCTION public.recalculate_caderno_statistics(caderno_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Resetar estatísticas do caderno específico
    UPDATE cadernos_questoes
    SET answered_questions = 0,
        correct_answers = 0,
        wrong_answers = 0
    WHERE id = caderno_id;
    
    -- Atualizar com base apenas nas últimas respostas para cada questão
    UPDATE cadernos_questoes c
    SET 
        answered_questions = subquery.total_answered,
        correct_answers = subquery.total_correct,
        wrong_answers = subquery.total_answered - subquery.total_correct
    FROM (
        SELECT 
            qc.caderno_id,
            COUNT(last_respostas.*) as total_answered,
            COUNT(CASE WHEN last_respostas.is_correta THEN 1 END) as total_correct
        FROM 
            questoes_caderno qc
        JOIN (
            -- Subconsulta para obter apenas a última resposta para cada questão
            SELECT DISTINCT ON (ra.questao_id, ra.aluno_id) 
                ra.id,
                ra.questao_id,
                ra.aluno_id,
                ra.is_correta
            FROM 
                respostas_alunos ra
            ORDER BY 
                ra.questao_id, ra.aluno_id, ra.created_at DESC
        ) last_respostas ON last_respostas.questao_id = qc.questao_id AND last_respostas.aluno_id = qc.user_id
        WHERE 
            qc.caderno_id = caderno_id
        GROUP BY 
            qc.caderno_id
    ) AS subquery
    WHERE c.id = subquery.caderno_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para recalcular estatísticas de todos os cadernos de um usuário
CREATE OR REPLACE FUNCTION public.recalculate_user_cadernos_statistics(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Resetar estatísticas de todos os cadernos do usuário
    UPDATE cadernos_questoes
    SET answered_questions = 0,
        correct_answers = 0,
        wrong_answers = 0
    WHERE user_id = recalculate_user_cadernos_statistics.user_id;
    
    -- Atualizar com base apenas nas últimas respostas para cada questão
    UPDATE cadernos_questoes c
    SET 
        answered_questions = subquery.total_answered,
        correct_answers = subquery.total_correct,
        wrong_answers = subquery.total_answered - subquery.total_correct
    FROM (
        SELECT 
            qc.caderno_id,
            COUNT(last_respostas.*) as total_answered,
            COUNT(CASE WHEN last_respostas.is_correta THEN 1 END) as total_correct
        FROM 
            questoes_caderno qc
        JOIN (
            -- Subconsulta para obter apenas a última resposta para cada questão
            SELECT DISTINCT ON (ra.questao_id, ra.aluno_id) 
                ra.id,
                ra.questao_id,
                ra.aluno_id,
                ra.is_correta
            FROM 
                respostas_alunos ra
            ORDER BY 
                ra.questao_id, ra.aluno_id, ra.created_at DESC
        ) last_respostas ON last_respostas.questao_id = qc.questao_id AND last_respostas.aluno_id = qc.user_id
        WHERE 
            qc.user_id = recalculate_user_cadernos_statistics.user_id
        GROUP BY 
            qc.caderno_id
    ) AS subquery
    WHERE c.id = subquery.caderno_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões para que usuários autenticados possam executar a função
GRANT EXECUTE ON FUNCTION public.recalculate_caderno_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_cadernos_statistics(UUID) TO authenticated; 