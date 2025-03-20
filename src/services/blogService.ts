import { supabase } from "@/integrations/supabase/client";
import { BlogPost, Region } from "@/components/blog/types";
import { Database } from "@/integrations/supabase/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";

// Função para mapear os dados do banco para o formato da aplicação
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
    readingTime: post.reading_time ? String(post.reading_time) : undefined,
    relatedPosts: Array.isArray(post.related_posts) ? post.related_posts.map(String) : [],
    featured: post.featured
  };
  
  console.log('Post mapeado do banco:', { 
    id: mappedPost.id, 
    state: mappedPost.state, 
    original_state: post.state 
  });
  
  return mappedPost;
}

// Função para mapear os dados da aplicação para o formato do banco
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
    reading_time: post.readingTime ? parseInt(post.readingTime, 10) || 0 : 0,
    related_posts: post.relatedPosts ? post.relatedPosts.map(String) : [],
    featured: post.featured
  };
}

// Função para buscar todos os posts do blog
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts do blog:', error);
      return MOCK_BLOG_POSTS; // Retorna posts mockados em caso de erro
    }

    return data && data.length > 0 ? data.map(mapDatabasePostToAppPost) : MOCK_BLOG_POSTS;
  } catch (error) {
    console.error('Exceção ao buscar posts do blog:', error);
    return MOCK_BLOG_POSTS;
  }
}

// Função para buscar um post específico pelo slug
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Primeiro, verificar se a tabela existe
    const { error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.info('Tabela de posts do blog não existe, usando dados mockados');
      // Tabela não existe, usar mock data
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
      // Tentar encontrar no mock data
      const mockPost = MOCK_BLOG_POSTS.find(post => post.slug === slug);
      return mockPost || null;
    }

    return data ? mapDatabasePostToAppPost(data) : null;
  } catch (error) {
    console.error(`Exceção ao buscar post com slug ${slug}:`, error);
    // Tentar encontrar no mock data
    const mockPost = MOCK_BLOG_POSTS.find(post => post.slug === slug);
    return mockPost || null;
  }
}

// Função para criar um novo post
export async function createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<BlogPost | null> {
  const dbPost = mapAppPostToDatabasePost(post);
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([dbPost])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar post:', error);
    return null;
  }

  return data ? mapDatabasePostToAppPost(data) : null;
}

// Função para atualizar um post existente
export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | null> {
  const updateData: Partial<Database['public']['Tables']['blog_posts']['Update']> = {};
  
  // Mapear campos do modelo da aplicação para o modelo do banco
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
  if (post.readingTime !== undefined) updateData.reading_time = post.readingTime ? parseInt(post.readingTime, 10) || 0 : 0;
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
    return null;
  }

  return data ? mapDatabasePostToAppPost(data) : null;
}

// Função para excluir um post
export async function deleteBlogPost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir post ${id}:`, error);
    return false;
  }

  return true;
}

/**
 * Incrementa o contador de curtidas de um post
 */
export const incrementLikes = async (postId: string): Promise<boolean> => {
  try {
    // Verificar se estamos usando dados mockados (IDs simples como "1", "2", etc.)
    const isMockId = /^\d+$/.test(postId) || postId.length < 10;
    
    if (isMockId) {
      console.info(`Usando ID mockado: ${postId}, simulando incremento de curtidas`);
      // Para dados mockados, apenas simular sucesso
      return true;
    }
    
    // Para IDs reais, verificar se é um UUID válido
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
      console.error(`ID inválido para incrementar curtidas: ${postId}`);
      return false;
    }

    const { data, error } = await supabase.rpc('increment_blog_post_likes', {
      post_id: postId
    });

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

/**
 * Incrementa o contador de comentários de um post
 */
export const incrementComments = async (postId: string): Promise<boolean> => {
  try {
    // Verificar se estamos usando dados mockados (IDs simples como "1", "2", etc.)
    const isMockId = /^\d+$/.test(postId) || postId.length < 10;
    
    if (isMockId) {
      console.info(`Usando ID mockado: ${postId}, simulando incremento de comentários`);
      // Para dados mockados, apenas simular sucesso
      return true;
    }
    
    // Para IDs reais, verificar se é um UUID válido
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
      console.error(`ID inválido para incrementar comentários: ${postId}`);
      return false;
    }

    const { data, error } = await supabase.rpc('increment_blog_post_comments', {
      post_id: postId
    });

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
