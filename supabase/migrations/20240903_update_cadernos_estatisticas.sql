-- Criação de função para atualizar estatísticas de cadernos com base nas respostas
CREATE OR REPLACE FUNCTION public.update_caderno_statistics()
RETURNS TRIGGER AS $$
DECLARE 
    caderno_id UUID;
    last_response BOOLEAN;
BEGIN
    -- Buscar o caderno_id para a questão respondida
    SELECT qc.caderno_id INTO caderno_id 
    FROM questoes_caderno qc 
    WHERE qc.questao_id = NEW.questao_id AND qc.user_id = NEW.aluno_id;
    
    -- Se a questão estiver em algum caderno do usuário, atualizar as estatísticas
    IF caderno_id IS NOT NULL THEN
        -- Primeiro verificar se já existem respostas anteriores para esta questão
        -- Se existir, precisamos reverter a contagem anterior
        UPDATE cadernos_questoes c
        SET 
            answered_questions = CASE
                WHEN (SELECT COUNT(*) FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id) > 0 
                THEN c.answered_questions 
                ELSE c.answered_questions + 1 
            END,
            correct_answers = CASE
                WHEN (SELECT is_correta FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id
                     ORDER BY ra.created_at DESC LIMIT 1) IS TRUE AND NEW.is_correta IS FALSE
                THEN c.correct_answers - 1
                WHEN (SELECT is_correta FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id
                     ORDER BY ra.created_at DESC LIMIT 1) IS FALSE AND NEW.is_correta IS TRUE
                THEN c.correct_answers + 1
                WHEN (SELECT COUNT(*) FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id) = 0 AND NEW.is_correta IS TRUE
                THEN c.correct_answers + 1
                ELSE c.correct_answers
            END,
            wrong_answers = CASE
                WHEN (SELECT is_correta FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id
                     ORDER BY ra.created_at DESC LIMIT 1) IS TRUE AND NEW.is_correta IS FALSE
                THEN c.wrong_answers + 1
                WHEN (SELECT is_correta FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id
                     ORDER BY ra.created_at DESC LIMIT 1) IS FALSE AND NEW.is_correta IS TRUE
                THEN c.wrong_answers - 1
                WHEN (SELECT COUNT(*) FROM respostas_alunos ra 
                     WHERE ra.questao_id = NEW.questao_id 
                     AND ra.aluno_id = NEW.aluno_id 
                     AND ra.id <> NEW.id) = 0 AND NEW.is_correta IS FALSE
                THEN c.wrong_answers + 1
                ELSE c.wrong_answers
            END
        WHERE c.id = caderno_id AND c.user_id = NEW.aluno_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criação do trigger para as novas respostas
DROP TRIGGER IF EXISTS update_caderno_statistics_trigger ON public.respostas_alunos;

CREATE TRIGGER update_caderno_statistics_trigger
AFTER INSERT ON public.respostas_alunos
FOR EACH ROW
EXECUTE FUNCTION public.update_caderno_statistics();

-- Função para recalcular todas as estatísticas de cadernos existentes
CREATE OR REPLACE FUNCTION public.recalculate_all_cadernos_statistics()
RETURNS VOID AS $$
BEGIN
    -- Resetar estatísticas
    UPDATE cadernos_questoes
    SET answered_questions = 0,
        correct_answers = 0,
        wrong_answers = 0;
    
    -- Atualizar com base nas últimas respostas existentes para cada questão
    -- Usando subquery com DISTINCT ON para pegar apenas a última resposta por questão
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
        GROUP BY 
            qc.caderno_id
    ) AS subquery
    WHERE c.id = subquery.caderno_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função para atualizar todos os cadernos existentes
SELECT public.recalculate_all_cadernos_statistics(); 