import { supabase } from "@/integrations/supabase/client";
import { BlogPost, Region } from "@/components/blog/types";
import { Database } from "@/integrations/supabase/types";

// Variável para armazenar cache dos posts
let postsCache: BlogPost[] = [];
let lastCacheTime = 0;
const CACHE_TTL = 60000; // 1 minuto em ms

// Função para mapear os dados do banco para o formato da aplicação
function mapDatabasePostToAppPost(post: Database['public']['Tables']['blog_posts']['Row']): BlogPost {
  return {
    id: post.id,
    title: post.title,
    summary: post.summary,
    content: post.content,
    author: post.author,
    authorAvatar: post.author_avatar ?? undefined,
    commentCount: post.comment_count || 0,
    likesCount: post.likes_count || 0,
    createdAt: post.created_at,
    slug: post.slug,
    category: post.category,
    region: post.region as Region | undefined,
    state: post.state ?? undefined,
    tags: post.tags || [],
    metaDescription: post.meta_description ?? undefined,
    metaKeywords: post.meta_keywords || [],
    featuredImage: post.featured_image ?? undefined,
    readingTime: post.reading_time ? String(post.reading_time) : undefined,
    relatedPosts: Array.isArray(post.related_posts) ? post.related_posts.map(String) : [],
    featured: post.featured ?? undefined
  };
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
    reading_time: post.readingTime ? parseInt(String(post.readingTime), 10) || 0 : 0,
    related_posts: post.relatedPosts ? post.relatedPosts.map(String) : [],
    featured: post.featured
  };
}

// Função para buscar todos os posts do blog
export async function fetchBlogPosts(authorFilter?: string): Promise<BlogPost[]> {
  try {
    const now = Date.now();
    console.log("fetchBlogPosts chamada com filtro:", authorFilter);
    
    // Usar cache se disponível e não expirado (exceto quando temos filtro de autor)
    if (postsCache.length > 0 && !authorFilter && (now - lastCacheTime) < CACHE_TTL) {
      console.log('Usando cache de posts (sem filtro)');
      return postsCache;
    }

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Se tiver um filtro de autor, aplicar
    if (authorFilter) {
      console.log(`Aplicando filtro de autor: author = "${authorFilter}"`);
      query = query.eq('author', authorFilter);
    }

    console.log("Executando consulta Supabase:", authorFilter ? "com filtro" : "sem filtro");
    const { data, error } = await query;
    console.log("Resultado da consulta:", { 
      temDados: !!data, 
      quantidadeDados: data?.length || 0, 
      temErro: !!error, 
      mensagemErro: error?.message 
    });

    if (error) {
      console.error('Erro ao buscar posts do blog:', error);
      
      // Em caso de erro, retornar cache ou array vazio
      if (postsCache.length > 0 && !authorFilter) {
        console.log('Usando cache existente devido a erro');
        return postsCache;
      }
      
      // Se não temos cache ou estamos filtrando por autor, retornar array vazio
      return [];
    }

    // Se temos dados reais, atualizar o cache (apenas para consultas sem filtro)
    if (data && data.length > 0 && !authorFilter) {
      const mappedData = data.map(mapDatabasePostToAppPost);
      postsCache = mappedData;
      lastCacheTime = now;
      console.log('Cache de posts atualizado:', mappedData.length, 'posts');
      return mappedData;
    } else if (data && data.length > 0) {
      // Dados com filtro, não armazenar em cache
      const mappedData = data.map(mapDatabasePostToAppPost);
      console.log(`Retornando ${mappedData.length} posts filtrados por autor "${authorFilter}" (sem atualizar cache)`);
      return mappedData;
    } else {
      console.log(`Nenhum post encontrado${authorFilter ? ` para o autor "${authorFilter}"` : ""}`);
      return []; // Retornar array vazio em vez de usar dados mockados
    }
    
    // Se temos cache mas não dados novos, manter o cache
    if (postsCache.length > 0) {
      console.log('Sem novos dados - mantendo cache existente');
      return postsCache;
    }
    
    // Caso todos os outros casos falhem, retornar array vazio
    return [];
  } catch (error) {
    console.error('Exceção ao buscar posts do blog:', error);
    
    // Em caso de erro, verificar se temos cache
    if (postsCache.length > 0 && !authorFilter) {
      console.log('Usando cache existente devido a exceção');
      return postsCache;
    }
    
    // Se não temos cache, retornar array vazio
    return [];
  }
}

// Função para buscar um post específico pelo slug
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    console.log('Buscando post com slug:', slug);
    
    // Primeiro, verificar no cache para evitar chamadas desnecessárias
    if (postsCache.length > 0) {
      const cachedPost = postsCache.find(post => post.slug === slug);
      if (cachedPost) {
        console.log('Post encontrado no cache:', cachedPost.title);
        return cachedPost;
      }
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Erro ao buscar post com slug ${slug}:`, error);
      return null;
    }

    console.log('Post encontrado no banco:', data);
    const post = data ? mapDatabasePostToAppPost(data) : null;
    
    // Se encontramos o post no banco de dados e não está no cache, 
    // pode ser útil atualizar o cache geral para incluir este post
    if (post && postsCache.length > 0 && !postsCache.some(p => p.id === post.id)) {
      console.log('Adicionando post ao cache existente');
      postsCache = [post, ...postsCache];
    }
    
    return post;
  } catch (error) {
    console.error(`Exceção ao buscar post com slug ${slug}:`, error);
    return null;
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
  if (post.readingTime !== undefined) {
    if (typeof post.readingTime === 'string') {
      const parsedValue = parseInt(post.readingTime, 10);
      updateData.reading_time = !isNaN(parsedValue) ? parsedValue : 0;
    } else if (typeof post.readingTime === 'number') {
      updateData.reading_time = post.readingTime;
    } else {
      updateData.reading_time = 0;
    }
  }
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
  try {
    console.log('Tentando excluir post com ID:', id);
    
    // Verificar se estamos usando dados mockados (IDs simples como "1", "2", etc.)
    const isMockId = /^\d+$/.test(id) || id.length < 10;
    
    if (isMockId) {
      console.info(`ID mockado detectado: ${id}, simulando exclusão`);
      // Para dados mockados, apenas simular sucesso
      return true;
    }
    
    // Para IDs reais, verificar se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error(`ID inválido para excluir post: ${id}`);
      return false;
    }
    
    // Buscar informações do post para realizar uma verificação local de permissões
    const { data: postData, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, author')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erro ao buscar post ${id} antes de excluir:`, fetchError);
      if (fetchError.code === 'PGRST116') {
        console.error('Post não encontrado, pode já ter sido excluído ou não existe');
      }
      return false;
    }
    
    if (!postData) {
      console.error(`Post com ID ${id} não encontrado`);
      return false;
    }
    
    console.log(`Post encontrado: ID=${id}, Autor=${postData.author}`);
    
    // Excluir o post
    console.log(`Executando exclusão do post ${id}`);
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erro ao excluir post ${id}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Verificar se é erro de permissão
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.error(`Erro de permissão: o usuário atual não tem autorização para excluir este post. O autor é: ${postData.author}`);
        
        // Solicitar informações do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          console.log('Usuário atual:', userData.user.id);
          
          // Buscar perfil para obter role e nome
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, nome, role, nivel')
            .eq('id', userData.user.id)
            .single();
            
          console.log('Perfil do usuário:', profileData);
        }
      }
      
      return false;
    }

    console.log(`Post ${id} excluído com sucesso`);
    return true;
  } catch (error) {
    console.error(`Exceção ao excluir post ${id}:`, error);
    return false;
  }
}

/**
 * Incrementa o contador de curtidas de um post
 */
export const incrementLikes = async (postId: string): Promise<boolean> => {
  try {
    console.log('Iniciando incremento de curtidas para o post:', postId);
    
    // Verificar se estamos usando dados mockados (IDs simples como "1", "2", etc.)
    const isMockId = /^\d+$/.test(postId) || postId.length < 10;
    
    if (isMockId) {
      console.info(`Usando ID mockado: ${postId}, simulando incremento de curtidas`);
      // Para dados mockados, apenas simular sucesso
      return true;
    }
    
    // Para IDs reais, verificar se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      console.error(`ID inválido para incrementar curtidas: ${postId}`);
      return false;
    }

    console.log('Chamando RPC increment_blog_post_likes com post_id:', postId);
    const { data, error, status } = await supabase.rpc('increment_blog_post_likes', {
      post_id: postId
    });

    if (error) {
      console.error('Erro ao incrementar curtidas:', {
        error,
        status,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      // Se o erro for de autenticação, retornar false
      if (error.message.includes('não autenticado') || error.code === 'PGRST301') {
        console.error('Usuário não está autenticado');
        return false;
      }

      // Para outros erros, também retornar false
      return false;
    }

    console.log('Resultado da RPC increment_blog_post_likes:', { data, status });
    return data === true;
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

    const { error } = await supabase.rpc('increment_blog_post_comments', {
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

export const resetAllLikes = async (): Promise<boolean> => {
  try {
    console.log('Iniciando reset de todas as curtidas');
    
    // Usando consulta SQL direta em vez de RPC
    const { error } = await supabase
      .from('blog_posts')
      .update({ likes_count: 0 })
      .neq('id', ''); // Condição que afetará todas as linhas

    if (error) {
      console.error('Erro ao resetar curtidas:', error);
      return false;
    }

    console.log('Curtidas resetadas com sucesso');
    return true;
  } catch (error) {
    console.error('Exceção ao resetar curtidas:', error);
    return false;
  }
};

export const resetBlogPostLikes = async (postId: string): Promise<boolean> => {
  try {
    console.log('Iniciando reset de curtidas para o post:', postId);
    
    // Verificar se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      console.error(`ID inválido para resetar curtidas: ${postId}`);
      return false;
    }

    // Usando consulta SQL direta em vez de RPC
    const { error } = await supabase
      .from('blog_posts')
      .update({ likes_count: 0 })
      .eq('id', postId);

    if (error) {
      console.error('Erro ao resetar curtidas:', error);
      return false;
    }

    console.log('Curtidas resetadas com sucesso para o post:', postId);
    return true;
  } catch (error) {
    console.error('Exceção ao resetar curtidas:', error);
    return false;
  }
};

// Função para diagnóstico do problema de exclusão de posts
export async function diagnoseBlogPostsTable(): Promise<any> {
  try {
    // 1. Verificar se o usuário está autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Erro ao verificar autenticação:", authError);
      return {
        success: false,
        error: authError,
        message: "Não foi possível verificar a autenticação"
      };
    }

    const userId = authData?.user?.id;
    console.log("Usuário autenticado:", userId);
    
    // 2. Verificar o perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      return {
        success: false,
        error: profileError,
        authData,
        message: "Falha ao buscar perfil do usuário"
      };
    }
    
    console.log("Perfil do usuário:", profileData);
    
    // 3. Verificar se a tabela blog_posts existe
    const { data: tablesData, error: tablesError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
      
    if (tablesError) {
      console.error("Erro ao verificar tabela blog_posts:", tablesError);
      return {
        success: false,
        error: tablesError,
        authData,
        profileData,
        message: "Falha ao acessar tabela blog_posts"
      };
    }
    
    console.log("Tabela blog_posts acessível:", tablesData);
    
    // 4. Tentar inserir um post de teste (para verificar permissões de INSERT)
    const testPostData = {
      title: "Teste de Diagnóstico",
      summary: "Post criado para diagnóstico de permissões",
      content: "Conteúdo de teste para diagnóstico",
      author: profileData.nome || "Usuário de Teste",
      slug: "test-diagnostic-" + new Date().getTime(),
      category: "Diagnóstico"
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('blog_posts')
      .insert([testPostData])
      .select();
      
    console.log("Tentativa de inserção:", insertData, insertError);
    
    let postId;
    if (insertData && insertData.length > 0) {
      postId = insertData[0].id;
      console.log("Post de teste criado com ID:", postId);
    }
    
    // 5. Se conseguiu criar um post, tentar excluí-lo
    let deleteResult = null;
    let deleteError = null;
    
    if (postId) {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
        
      deleteError = error;
      deleteResult = !error;
      console.log("Tentativa de exclusão:", deleteResult, deleteError);
    }
    
    // 6. Verificar políticas existentes (usando SQL)
    const { data: policies, error: policiesError } = await supabase.rpc(
      'execute_sql', 
      { 
        sql_query: `
          SELECT 
            polname AS policy_name,
            polrelid::regclass AS table_name,
            polcmd AS command_type, 
            pg_get_expr(polqual, polrelid) AS using_expr
          FROM 
            pg_policy
          WHERE 
            polrelid = 'public.blog_posts'::regclass
        `
      }
    );
    
    // 7. Retornar resultado completo do diagnóstico
    return {
      success: true,
      authentication: {
        userId,
        authenticated: !!userId
      },
      profile: profileData,
      tableAccess: {
        exists: !!tablesData,
        data: tablesData
      },
      permissions: {
        insert: {
          success: !!insertData,
          error: insertError
        },
        delete: {
          success: deleteResult,
          error: deleteError,
          postId
        }
      },
      policies: {
        success: !!policies,
        error: policiesError,
        data: policies
      }
    };
  } catch (error) {
    console.error("Erro durante diagnóstico:", error);
    return {
      success: false,
      error
    };
  }
}
