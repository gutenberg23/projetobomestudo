-- Corrige possíveis dados mal formatados nas colunas de array
-- Esta migração corrige dados que podem ter sido salvos como strings em vez de arrays

-- Corrigir dados mal formatados na coluna assuntos
UPDATE disciplinaverticalizada 
SET assuntos = CASE 
  WHEN assuntos IS NULL THEN NULL
  WHEN jsonb_typeof(to_jsonb(assuntos)) = 'string' THEN 
    -- Se for uma string, converter para array
    CASE 
      WHEN assuntos::text LIKE '"%"' THEN 
        -- Está como string única, converter para array
        ARRAY[assuntos::text]
      ELSE 
        -- Outro formato, manter como está
        assuntos
    END
  ELSE 
    assuntos
END
WHERE assuntos IS NOT NULL;

-- Corrigir dados mal formatados na coluna topicos_filtro
UPDATE disciplinaverticalizada 
SET topicos_filtro = CASE 
  WHEN topicos_filtro IS NULL THEN NULL
  WHEN jsonb_typeof(to_jsonb(topicos_filtro)) = 'string' THEN 
    CASE 
      WHEN topicos_filtro::text LIKE '"%"' THEN 
        ARRAY[topicos_filtro::text]
      ELSE 
        topicos_filtro
    END
  ELSE 
    topicos_filtro
END
WHERE topicos_filtro IS NOT NULL;

-- Corrigir dados mal formatados na coluna disciplinas_filtro
UPDATE disciplinaverticalizada 
SET disciplinas_filtro = CASE 
  WHEN disciplinas_filtro IS NULL THEN NULL
  WHEN jsonb_typeof(to_jsonb(disciplinas_filtro)) = 'string' THEN 
    CASE 
      WHEN disciplinas_filtro::text LIKE '"%"' THEN 
        ARRAY[disciplinas_filtro::text]
      ELSE 
        disciplinas_filtro
    END
  ELSE 
    disciplinas_filtro
END
WHERE disciplinas_filtro IS NOT NULL;

-- Corrigir dados mal formatados na coluna bancas_filtro
UPDATE disciplinaverticalizada 
SET bancas_filtro = CASE 
  WHEN bancas_filtro IS NULL THEN NULL
  WHEN jsonb_typeof(to_jsonb(bancas_filtro)) = 'string' THEN 
    CASE 
      WHEN bancas_filtro::text LIKE '"%"' THEN 
        ARRAY[bancas_filtro::text]
      ELSE 
        bancas_filtro
    END
  ELSE 
    bancas_filtro
END
WHERE bancas_filtro IS NOT NULL;