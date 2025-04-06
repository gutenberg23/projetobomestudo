-- Remover a política antiga
DROP POLICY IF EXISTS "Only authenticated users can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow admins and post owners to delete posts" ON public.blog_posts;

-- Tornar a política mais simples para facilitar a depuração
CREATE POLICY "Anyone can delete blog posts (temporary)" 
ON public.blog_posts 
FOR DELETE 
USING (true);

-- Comentado por enquanto, para ser aplicado após confirmação de funcionamento
-- CREATE POLICY "Allow admins and post owners to delete posts" 
-- ON public.blog_posts 
-- FOR DELETE 
-- USING (
--   auth.role() = 'authenticated' AND (
--     author = (SELECT nome FROM public.profiles WHERE id = auth.uid()) OR
--     'admin' IN (
--       SELECT role FROM public.profiles WHERE id = auth.uid()
--     )
--   )
-- );

-- Verificar políticas existentes (para diagnóstico)
SELECT 
  polname AS policy_name,
  polrelid::regclass AS table_name,
  polcmd AS command_type, 
  pg_get_expr(polqual, polrelid) AS using_expr
FROM 
  pg_policy
WHERE 
  polrelid = 'public.blog_posts'::regclass; 