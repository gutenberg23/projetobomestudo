-- Remover a política antiga
DROP POLICY IF EXISTS "Only authenticated users can delete blog posts" ON public.blog_posts;

-- Criar uma nova política que permite que administradores e o próprio autor excluam o post
CREATE POLICY "Allow admins and post owners to delete posts" 
ON public.blog_posts 
FOR DELETE 
USING (
  auth.role() = 'authenticated' AND (
    -- O usuário é o autor do post
    author = (SELECT nome FROM public.profiles WHERE id = auth.uid()) OR 
    -- OU o usuário é administrador
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
    (SELECT nivel FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
);

-- Criar uma função para diagnóstico de permissões de exclusão
CREATE OR REPLACE FUNCTION check_can_delete_post(post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_user_nivel TEXT;
  v_user_nome TEXT;
  v_post_author TEXT;
  v_post_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  -- Checar se o usuário está autenticado
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'can_delete', false,
      'reason', 'Usuário não autenticado'
    );
  END IF;
  
  -- Buscar informações do usuário
  SELECT role, nivel, nome 
  INTO v_user_role, v_user_nivel, v_user_nome
  FROM public.profiles 
  WHERE id = v_user_id;
  
  -- Verificar se o post existe
  SELECT EXISTS(
    SELECT 1 FROM public.blog_posts WHERE id = post_id
  ), author INTO v_post_exists, v_post_author
  FROM public.blog_posts
  WHERE id = post_id;
  
  IF NOT v_post_exists THEN
    RETURN jsonb_build_object(
      'can_delete', false,
      'reason', 'Post não encontrado'
    );
  END IF;
  
  -- Construir resultado detalhado
  v_result := jsonb_build_object(
    'user_id', v_user_id,
    'user_role', v_user_role,
    'user_nivel', v_user_nivel,
    'user_nome', v_user_nome,
    'post_author', v_post_author,
    'is_admin', (v_user_role = 'admin' OR v_user_nivel = 'admin'),
    'is_author', (v_user_nome = v_post_author),
    'can_delete', ((v_user_role = 'admin' OR v_user_nivel = 'admin') OR (v_user_nome = v_post_author))
  );
  
  RETURN v_result;
END;
$$; 