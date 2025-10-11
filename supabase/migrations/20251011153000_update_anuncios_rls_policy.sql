-- Atualizar política RLS para tabela de anúncios para resolver erro 406
-- Remover restrições de data da política de leitura pública para evitar conflitos
-- com filtros aplicados no cliente

-- Remover políticas antigas
DROP POLICY IF EXISTS "Leitura pública de anúncios ativos" ON public.anuncios;
DROP POLICY IF EXISTS "Admins gerenciam anúncios" ON public.anuncios;

-- Criar nova política de leitura pública que apenas verifica se o anúncio está ativo
-- As verificações de data serão feitas no lado do cliente
CREATE POLICY "Leitura pública de anúncios ativos"
ON public.anuncios FOR SELECT
TO public
USING (ativo = true);

-- Política para administradores continuará a mesma
CREATE POLICY "Admins gerenciam anúncios"
ON public.anuncios FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());