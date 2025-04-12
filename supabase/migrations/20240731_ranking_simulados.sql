-- Adicionar colunas relacionadas ao ranking na tabela de simulados
ALTER TABLE public.simulados 
ADD COLUMN IF NOT EXISTS ranking_is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ranking_updated_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhorar consultas de ranking
CREATE INDEX IF NOT EXISTS idx_user_simulado_results_score 
ON public.user_simulado_results (simulado_id, acertos DESC, erros, created_at);

-- Criar uma função para obter o ranking de um simulado
CREATE OR REPLACE FUNCTION public.get_simulado_ranking(p_simulado_id UUID)
RETURNS TABLE (
    ranking_position INTEGER,
    user_id UUID,
    nome TEXT,
    acertos INTEGER,
    erros INTEGER,
    aproveitamento NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_results AS (
        SELECT
            ROW_NUMBER() OVER (ORDER BY usr.acertos DESC, usr.erros ASC, usr.created_at ASC)::INTEGER as ranking_position,
            usr.user_id,
            p.nome,
            usr.acertos,
            usr.erros,
            CASE
                WHEN (usr.acertos + usr.erros) > 0 THEN 
                    ROUND((usr.acertos::NUMERIC / (usr.acertos + usr.erros)) * 100, 2)
                ELSE 0
            END as aproveitamento,
            usr.created_at
        FROM
            public.user_simulado_results usr
        JOIN
            public.profiles p ON usr.user_id = p.id
        WHERE
            usr.simulado_id = p_simulado_id
    )
    SELECT * FROM ranked_results;
END;
$$ LANGUAGE plpgsql;

-- Remover políticas existentes se já existirem
DROP POLICY IF EXISTS "Administradores podem atualizar ranking_is_public" ON public.simulados;
DROP POLICY IF EXISTS "Visualização pública de rankings" ON public.user_simulado_results;
DROP POLICY IF EXISTS "Administradores podem ver todos os rankings" ON public.user_simulado_results;

-- Adicionar política RLS para permitir que administradores gerenciem a visibilidade do ranking
CREATE POLICY "Administradores podem atualizar ranking_is_public" 
ON public.simulados
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (nivel = 'admin' OR role = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (nivel = 'admin' OR role = 'admin')
    )
);

-- Políticas para visualização de ranking
CREATE POLICY "Visualização pública de rankings" 
ON public.user_simulado_results FOR SELECT
USING (
    -- Visualização pública de resultados se ranking_is_public for true
    EXISTS (
        SELECT 1 FROM public.simulados
        WHERE id = simulado_id AND ranking_is_public = true
    )
);

CREATE POLICY "Administradores podem ver todos os rankings" 
ON public.user_simulado_results FOR SELECT
USING (
    -- Administradores podem ver todos os rankings
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (nivel = 'admin' OR role = 'admin')
    )
); 