-- Verifica se há duplicidades de respostas (várias respostas para a mesma questão)
-- e executa a função de recálculo de estatísticas

-- Adiciona comentário a respeito do problema encontrado
COMMENT ON TABLE public.cadernos_questoes IS 'Tabela que armazena os cadernos de questões. As estatísticas (answered_questions, correct_answers, wrong_answers) 
são calculadas considerando apenas a última resposta do usuário para cada questão.';

-- Log de duplicidades encontradas (para diagnóstico)
DO $$
DECLARE
    caderno_count INTEGER;
    duplicados_count INTEGER;
BEGIN
    -- Contar cadernos com possíveis estatísticas incorretas
    SELECT COUNT(DISTINCT cq.id) INTO caderno_count
    FROM cadernos_questoes cq
    JOIN questoes_caderno qc ON qc.caderno_id = cq.id
    WHERE (
        SELECT COUNT(DISTINCT ra.questao_id) 
        FROM respostas_alunos ra 
        JOIN questoes_caderno qc2 ON ra.questao_id = qc2.questao_id AND ra.aluno_id = qc2.user_id
        WHERE qc2.caderno_id = cq.id
    ) <> cq.answered_questions;

    -- Contar questões com múltiplas respostas
    SELECT COUNT(*) INTO duplicados_count
    FROM (
        SELECT ra.aluno_id, ra.questao_id, COUNT(*) as resposta_count
        FROM respostas_alunos ra
        GROUP BY ra.aluno_id, ra.questao_id
        HAVING COUNT(*) > 1
    ) as duplicados;

    -- Registrar os resultados para referência
    RAISE NOTICE 'Cadernos com estatísticas potencialmente incorretas: %', caderno_count;
    RAISE NOTICE 'Questões com múltiplas respostas: %', duplicados_count;
END $$;

-- Recalcular todas as estatísticas para garantir que estão corretas
SELECT public.recalculate_all_cadernos_statistics(); 