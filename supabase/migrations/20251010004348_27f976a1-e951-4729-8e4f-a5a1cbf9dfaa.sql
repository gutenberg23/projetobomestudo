-- Fase 1: Correções de Segurança Urgentes
BEGIN;

-- 1.1 Corrigir política perigosa de delete do blog_posts
DROP POLICY IF EXISTS "Anyone can delete blog posts (temporary)" ON public.blog_posts;

-- Adicionar políticas seguras para blog_posts
CREATE POLICY "Leitura pública de posts" ON public.blog_posts
FOR SELECT TO public USING (true);

CREATE POLICY "Jornalistas e admins criam posts" ON public.blog_posts
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'jornalista'::app_role)
);

CREATE POLICY "Autor ou admin edita posts" ON public.blog_posts
FOR UPDATE TO authenticated
USING (
  author = (SELECT nome FROM profiles WHERE id = auth.uid()) OR
  public.is_admin()
)
WITH CHECK (
  author = (SELECT nome FROM profiles WHERE id = auth.uid()) OR
  public.is_admin()
);

CREATE POLICY "Apenas admins deletam posts" ON public.blog_posts
FOR DELETE TO authenticated
USING (public.is_admin());

-- 1.2 Adicionar proteção explícita para tabela profiles
CREATE POLICY "Negar acesso público a perfis" ON public.profiles
FOR SELECT TO anon
USING (false);

COMMIT;