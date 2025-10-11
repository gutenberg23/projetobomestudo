-- Adicionar políticas para a tabela simulados

-- Habilitar RLS (já deve estar habilitado, mas vamos garantir)
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (opcional - se quiser que usuários não autenticados possam ver)
-- CREATE POLICY "Leitura pública de simulados"
-- ON public.simulados FOR SELECT
-- TO public
-- USING (true);

-- Política para administradores gerenciarem simulados
CREATE POLICY "Admins gerenciam simulados"
ON public.simulados FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Política para professores visualizarem simulados
CREATE POLICY "Professores veem simulados"
ON public.simulados FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'professor') OR public.is_admin());

-- Verificar se as políticas foram aplicadas corretamente
-- SELECT * FROM pg_policy WHERE polrelid = 'simulados'::regclass;