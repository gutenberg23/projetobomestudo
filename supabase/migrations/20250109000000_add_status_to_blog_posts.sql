-- Adicionar campo status à tabela blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' 
CHECK (status IN ('draft', 'published', 'archived'));

-- Criar índice para melhor performance nas consultas por status
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- Atualizar a política de visualização para mostrar apenas posts publicados para usuários não autenticados
DROP POLICY IF EXISTS "Anyone can view blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (
  status = 'published' OR 
  (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL)
);

-- Comentário explicativo
COMMENT ON COLUMN public.blog_posts.status IS 'Status do post: draft (rascunho), published (publicado), archived (arquivado)';