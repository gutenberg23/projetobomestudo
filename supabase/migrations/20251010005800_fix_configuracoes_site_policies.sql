-- Corrigir políticas RLS da tabela configuracoes_site para usar o novo sistema de roles

-- Remover políticas antigas
DROP POLICY IF EXISTS "Apenas admins podem inserir configurações" ON public.configuracoes_site;
DROP POLICY IF EXISTS "Apenas admins podem atualizar configurações" ON public.configuracoes_site;
DROP POLICY IF EXISTS "Apenas admins podem excluir configurações" ON public.configuracoes_site;

-- Criar novas políticas usando o sistema de roles atualizado
CREATE POLICY "Apenas admins podem inserir configurações" ON public.configuracoes_site
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Apenas admins podem atualizar configurações" ON public.configuracoes_site
    FOR UPDATE TO authenticated
    USING (public.is_admin());

CREATE POLICY "Apenas admins podem excluir configurações" ON public.configuracoes_site
    FOR DELETE TO authenticated
    USING (public.is_admin());