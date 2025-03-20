import { supabase } from "@/integrations/supabase/client";
import { BlogPost, Region } from "@/components/blog/types";
import { Database } from "@/integrations/supabase/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { toast } from "@/components/ui/use-toast";

function mapDatabasePostToAppPost(post: Database['public']['Tables']['blog_posts']['Row']): BlogPost {
  const mappedPost = {
    id: post.id,
    title: post.title,
    summary: post.summary,
    content: post.content,
    author: post.author,
    authorAvatar: post.author_avatar,
    commentCount: post.comment_count || 0,
    likesCount: post.likes_count || 0,
    createdAt: post.created_at,
    slug: post.slug,
    category: post.category,
    region: post.region as Region | undefined,
    state: post.state,
    tags: post.tags || [],
    metaDescription: post.meta_description,
    metaKeywords: post.meta_keywords || [],
    featuredImage: post.featured_image,
    readingTime: post.reading_time ? String(post.reading_time) : '5 min',
    relatedPosts: Array.isArray(post.related_posts) ? post.related_posts.map(String) : [],
    featured: post.featured
  };
  
  return mappedPost;
}

function mapAppPostToDatabasePost(post: Omit<BlogPost, 'id' | 'createdAt'>): Omit<Database['public']['Tables']['blog_posts']['Insert'], 'id' | 'created_at'> {
  return {
    title: post.title,
    summary: post.summary,
    content: post.content,
    author: post.author,
    author_avatar: post.authorAvatar,
    comment_count: post.commentCount || 0,
    likes_count: post.likesCount || 0,
    slug: post.slug,
    category: post.category,
    region: post.region,
    state: post.state,
    tags: post.tags || [],
    meta_description: post.metaDescription,
    meta_keywords: post.metaKeywords || [],
    featured_image: post.featuredImage,
    reading_time: post.readingTime ? parseInt(post.readingTime, 10) || 5 : 5,
    related_posts: post.relatedPosts ? post.relatedPosts.map(String) : [],
    featured: post.featured
  };
}

async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('blog_posts').select('id').limit(1).maybeSingle();
    return !error;
  } catch (e) {
    console.error('Erro ao verificar conexão com Supabase:', e);
    return false;
  }
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      console.warn('Usando dados mockados devido a problemas de conectividade');
      return MOCK_BLOG_POSTS;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts do blog:', error);
      return MOCK_BLOG_POSTS;
    }

    return data && data.length > 0 ? data.map(mapDatabasePostToAppPost) : MOCK_BLOG_POSTS;
  } catch (error) {
    console.error('Exceção ao buscar posts do blog:', error);
    return MOCK_BLOG_POSTS;
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      console.warn('Usando dados mockados devido a problemas de conectividade');
      const mockPost = MOCK_BLOG_POSTS.find(post => post.slug === slug);
      return mockPost || null;
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Erro ao buscar post com slug ${slug}:`, error);
      const mockPost = MOCK_BLOG_POSTS.find(post => post.slug === slug);
      return mockPost || null;
    }

    return data ? mapDatabasePostToAppPost(data) : null;
  } catch (error) {
    console.error(`Exceção ao buscar post com slug ${slug}:`, error);
    const mockPost = MOCK_BLOG_POSTS.find(post => post.slug === slug);
    return mockPost || null;
  }
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<BlogPost | null> {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return null;
    }
    
    const dbPost = mapAppPostToDatabasePost(post);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([dbPost])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o post. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Post salvo com sucesso",
      description: "O post foi criado e está pronto para ser visualizado.",
    });
    
    return data ? mapDatabasePostToAppPost(data) : null;
  } catch (error) {
    console.error('Exceção ao criar post:', error);
    toast({
      title: "Erro ao salvar",
      description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | null> {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return null;
    }
    
    const updateData: Partial<Database['public']['Tables']['blog_posts']['Update']> = {};
    
    if (post.title !== undefined) updateData.title = post.title;
    if (post.summary !== undefined) updateData.summary = post.summary;
    if (post.content !== undefined) updateData.content = post.content;
    if (post.author !== undefined) updateData.author = post.author;
    if (post.authorAvatar !== undefined) updateData.author_avatar = post.authorAvatar;
    if (post.slug !== undefined) updateData.slug = post.slug;
    if (post.category !== undefined) updateData.category = post.category;
    if (post.region !== undefined) updateData.region = post.region;
    if (post.state !== undefined) updateData.state = post.state;
    if (post.tags !== undefined) updateData.tags = post.tags;
    if (post.metaDescription !== undefined) updateData.meta_description = post.metaDescription;
    if (post.metaKeywords !== undefined) updateData.meta_keywords = post.metaKeywords;
    if (post.featuredImage !== undefined) updateData.featured_image = post.featuredImage;
    if (post.readingTime !== undefined) updateData.reading_time = post.readingTime ? parseInt(post.readingTime, 10) || 5 : 5;
    if (post.relatedPosts !== undefined) updateData.related_posts = post.relatedPosts.map(String);
    if (post.featured !== undefined) updateData.featured = post.featured;

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar post ${id}:`, error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o post. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Post atualizado com sucesso",
      description: "As alterações foram salvas com sucesso.",
    });

    return data ? mapDatabasePostToAppPost(data) : null;
  } catch (error) {
    console.error(`Exceção ao atualizar post ${id}:`, error);
    toast({
      title: "Erro ao atualizar",
      description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      variant: "destructive"
    });
    return null;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
        variant: "destructive"
      });
      return false;
    }
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao excluir post ${id}:`, error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o post. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Post excluído com sucesso",
      description: "O post foi removido permanentemente.",
    });

    return true;
  } catch (error) {
    console.error(`Exceção ao excluir post ${id}:`, error);
    toast({
      title: "Erro ao excluir",
      description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      variant: "destructive"
    });
    return false;
  }
}

export const incrementLikes = async (postId: string): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      console.warn('Simulando incremento de curtidas (modo offline)');
      return true;
    }
    
    const isMockId = /^\d+$/.test(postId) || postId.length < 10;
    
    if (isMockId) {
      console.info(`Usando ID mockado: ${postId}, simulando incremento de curtidas`);
      return true;
    }
    
    const { error } = await supabase
      .from('blog_posts')
      .update({ likes_count: supabase.sql`likes_count + 1` })
      .eq('id', postId);

    if (error) {
      console.error('Erro ao incrementar curtidas:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exceção ao incrementar curtidas:', error);
    return false;
  }
};

export const incrementComments = async (postId: string): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      console.warn('Simulando incremento de comentários (modo offline)');
      return true;
    }
    
    const isMockId = /^\d+$/.test(postId) || postId.length < 10;
    
    if (isMockId) {
      console.info(`Usando ID mockado: ${postId}, simulando incremento de comentários`);
      return true;
    }
    
    const { error } = await supabase
      .from('blog_posts')
      .update({ comment_count: supabase.sql`comment_count + 1` })
      .eq('id', postId);

    if (error) {
      console.error('Erro ao incrementar comentários:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exceção ao incrementar comentários:', error);
    return false;
  }
};

export const incrementLikeCount = async (postId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ likes_count: supabase.rpc('increment_blog_post_likes', { post_id: postId }) })
      .eq('id', postId)
      .select('likes_count')
      .single();

    if (error) {
      console.error('Erro ao incrementar likes:', error);
      return 0;
    }

    return data?.likes_count || 0;
  } catch (error) {
    console.error('Erro ao incrementar likes:', error);
    return 0;
  }
};

export const incrementCommentCount = async (postId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ comment_count: supabase.rpc('increment_blog_post_comments', { post_id: postId }) })
      .eq('id', postId)
      .select('comment_count')
      .single();

    if (error) {
      console.error('Erro ao incrementar comentários:', error);
      return 0;
    }

    return data?.comment_count || 0;
  } catch (error) {
    console.error('Erro ao incrementar comentários:', error);
    return 0;
  }
};
