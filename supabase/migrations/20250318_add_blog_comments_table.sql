-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for blog_comments
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Allow public read access to blog comments" ON public.blog_comments
  FOR SELECT USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Allow authenticated users to create comments" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own comments
CREATE POLICY "Allow users to update their own comments" ON public.blog_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Allow users to delete their own comments" ON public.blog_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to increment comment likes
CREATE OR REPLACE FUNCTION public.increment_comment_likes(comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_comments
  SET likes_count = likes_count + 1
  WHERE id = comment_id;
END;
$$;

-- Create function to increment post comment count
CREATE OR REPLACE FUNCTION public.increment_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_posts
  SET comment_count = comment_count + 1
  WHERE id = post_id;
END;
$$;

-- Create function to decrement post comment count
CREATE OR REPLACE FUNCTION public.decrement_post_comment_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_posts
  SET comment_count = GREATEST(0, comment_count - 1)
  WHERE id = post_id;
END;
$$;

-- Create trigger to increment post comment count when a comment is added
CREATE OR REPLACE FUNCTION public.handle_comment_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.increment_post_comment_count(NEW.post_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_created();

-- Create trigger to decrement post comment count when a comment is deleted
CREATE OR REPLACE FUNCTION public.handle_comment_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.decrement_post_comment_count(OLD.post_id);
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_deleted();
