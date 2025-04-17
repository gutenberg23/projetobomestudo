-- Função para permitir que administradores executem SQL via RPC
-- Esta função pode representar um risco de segurança se não for protegida adequadamente
-- Usada apenas para tarefas administrativas específicas, como atualizar funções

-- Cria a função execute_sql que permite executar SQL arbitrário
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se o usuário atual é um administrador
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Permissão negada: apenas administradores podem executar esta função';
  END IF;

  -- Executa a query SQL
  EXECUTE sql_query;
END;
$$;

-- Defina permissão restrita na função execute_sql
REVOKE ALL ON FUNCTION public.execute_sql FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;

-- Comentário explicativo
COMMENT ON FUNCTION public.execute_sql IS 'Permite que administradores executem SQL via RPC. Uso restrito para tarefas administrativas específicas.'; 