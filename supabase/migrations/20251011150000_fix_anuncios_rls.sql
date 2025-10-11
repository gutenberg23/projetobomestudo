-- Corrigir política RLS para tabela de anúncios
-- A política anterior estava causando erro 406 devido a diferença de timezone entre cliente e servidor

-- Remover política antiga
DROP POLICY IF EXISTS "Leitura pública de anúncios ativos" ON public.anuncios;

-- Criar nova política que permite leitura pública com filtros corretos
CREATE POLICY "Leitura pública de anúncios ativos"
ON public.anuncios FOR SELECT
TO public
USING (
    ativo = true 
    AND data_inicio <= (NOW() AT TIME ZONE 'UTC')
    AND data_fim >= (NOW() AT TIME ZONE 'UTC')
);

-- Garantir que a política de administração ainda existe
DROP POLICY IF EXISTS "Admins gerenciam anúncios" ON public.anuncios;
CREATE POLICY "Admins gerenciam anúncios"
ON public.anuncios FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());