-- Script para corrigir política RLS da tabela anuncios
-- Este script deve ser executado no editor SQL do Supabase

-- Remover políticas antigas
DROP POLICY IF EXISTS "Leitura pública de anúncios ativos" ON public.anuncios;
DROP POLICY IF EXISTS "Admins gerenciam anúncios" ON public.anuncios;

-- Criar nova política de leitura pública que apenas verifica se o anúncio está ativo
-- As verificações de data serão feitas no lado do cliente
CREATE POLICY "Leitura pública de anúncios ativos"
ON public.anuncios FOR SELECT
TO public
USING (ativo = true);

-- Política para administradores
CREATE POLICY "Admins gerenciam anúncios"
ON public.anuncios FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Verificar se as políticas foram aplicadas corretamente
SELECT * FROM pg_policy WHERE polrelid = 'anuncios'::regclass;