-- Função para executar SQL arbitrário
-- AVISO: Esta função é potencialmente perigosa e deve ser usada apenas por administradores.
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin')
    ) THEN
        RAISE EXCEPTION 'Permissão negada: apenas administradores podem executar SQL arbitrário';
    END IF;
    
    -- Executar o SQL e retornar NULL (não queremos resultados específicos)
    EXECUTE sql;
    
    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar detalhes sobre o erro
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 