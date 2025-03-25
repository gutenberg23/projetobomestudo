-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_avatar TEXT,
  comment_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  region TEXT,
  state TEXT,
  tags TEXT[],
  meta_description TEXT,
  meta_keywords TEXT[],
  featured_image TEXT,
  reading_time INTEGER,
  related_posts TEXT[],
  featured BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Anyone can view blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can insert blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Grant execute permission on reset_blog_post_likes function
GRANT EXECUTE ON FUNCTION reset_blog_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_blog_post_likes(UUID) TO service_role;

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(featured) WHERE featured = true;

-- Drop all existing functions to avoid conflicts
DROP FUNCTION IF EXISTS increment_blog_post_likes(bigint);
DROP FUNCTION IF EXISTS increment_blog_post_likes(UUID);
DROP FUNCTION IF EXISTS increment_post_likes_v2(UUID);
DROP FUNCTION IF EXISTS reset_all_blog_post_likes();
DROP FUNCTION IF EXISTS reset_blog_post_likes(UUID);

-- Create new function with a different name
CREATE OR REPLACE FUNCTION increment_post_likes_v2(post_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Update the likes count
  UPDATE public.blog_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Erro ao incrementar curtidas: % %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION increment_blog_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts
  SET comment_count = comment_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset all likes
CREATE OR REPLACE FUNCTION reset_all_blog_post_likes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
  SET likes_count = 0,
      updated_at = now();
END;
$$;

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

-- Create the function with better error handling
CREATE OR REPLACE FUNCTION increment_blog_post_likes(post_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_post_exists boolean;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Check if post exists
  SELECT EXISTS (
    SELECT 1 
    FROM public.blog_posts 
    WHERE id = post_id
  ) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RAISE EXCEPTION 'Post não encontrado';
  END IF;

  -- Update the likes count
  UPDATE public.blog_posts
  SET 
    likes_count = likes_count + 1,
    updated_at = now()
  WHERE id = post_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Erro ao incrementar curtidas: % %', SQLERRM, SQLSTATE;
    RETURN false;
END;
$$;
