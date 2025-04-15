-- Função para retornar o total de questões por disciplina
CREATE OR REPLACE FUNCTION get_questoes_por_disciplina()
RETURNS TABLE (
  disciplina TEXT,
  total_questoes BIGINT
) 
LANGUAGE SQL
AS $$
  SELECT 
    q.discipline as disciplina, 
    COUNT(q.id) as total_questoes
  FROM 
    questoes q
  GROUP BY 
    q.discipline
  ORDER BY 
    total_questoes DESC
  LIMIT 10;
$$; 