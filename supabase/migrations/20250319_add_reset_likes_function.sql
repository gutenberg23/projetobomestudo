-- Drop existing function if exists
DROP FUNCTION IF EXISTS reset_blog_post_likes(UUID);

-- Create function to reset likes for a specific post
CREATE OR REPLACE FUNCTION reset_blog_post_likes(post_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_exists boolean;
BEGIN
  -- Check if post exists
  SELECT EXISTS (
    SELECT 1 
    FROM public.blog_posts 
    WHERE id = post_id
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RAISE EXCEPTION 'Post não encontrado';
  END IF;

  -- Reset likes count
  UPDATE public.blog_posts
  SET 
    likes_count = 0,
    updated_at = now()
  WHERE id = post_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao resetar curtidas: % %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$; 