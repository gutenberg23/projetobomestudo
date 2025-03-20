
import { supabase } from '@/integrations/supabase/client';
import { BlogComment } from '@/components/blog/types';
import { Database } from '@/integrations/supabase/types';

type CommentRow = Database['public']['Tables']['blog_comments']['Row'];

/**
 * Mapeia um comentário do Supabase para o formato da aplicação
 */
const mapCommentFromSupabase = (comment: CommentRow): BlogComment => {
  return {
    id: comment.id,
    postId: comment.post_id,
    content: comment.content,
    author: comment.author_name,
    authorId: comment.user_id,
    authorName: comment.author_name,
    authorAvatar: comment.author_avatar || undefined,
    likesCount: comment.likes_count,
    parentId: comment.parent_id || undefined,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    replies: [],
    userId: comment.user_id,
    isLiked: false
  };
};

/**
 * Busca todos os comentários de um post
 */
export const fetchCommentsByPostId = async (postId: string): Promise<BlogComment[]> => {
  try {
    // Verificar se estamos usando dados mockados (IDs simples como "1", "2", etc.)
    const isMockId = /^\d+$/.test(postId) || postId.length < 10;
    
    // Se for um ID mockado, retornar array vazio (não temos comentários mockados)
    if (isMockId) {
      console.info(`Usando ID mockado: ${postId}, retornando array vazio de comentários`);
      return [];
    }
    
    // Para IDs reais do banco, verificar se é um UUID válido
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
      console.error(`ID inválido para buscar comentários: ${postId}`);
      return [];
    }

    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      // Se a tabela não existir, retornar array vazio em vez de lançar erro
      if (error.code === '42P01') { // Código para "relation does not exist"
        console.info('Tabela de comentários ainda não existe, retornando array vazio');
        return [];
      }
      return []; // Retornar array vazio para qualquer erro, em vez de lançar exceção
    }

    // Mapear comentários do Supabase para o formato da aplicação
    const comments = data.map(mapCommentFromSupabase);

    // Organizar comentários em árvore (comentários e respostas)
    const rootComments: BlogComment[] = [];
    const commentMap: Record<string, BlogComment> = {};

    // Primeiro, criar um mapa de todos os comentários por ID
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Depois, organizar em árvore
    comments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        // Este é uma resposta, adicionar ao pai
        if (!commentMap[comment.parentId].replies) {
          commentMap[comment.parentId].replies = [];
        }
        commentMap[comment.parentId].replies!.push(commentMap[comment.id]);
      } else {
        // Este é um comentário raiz
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  } catch (error) {
    console.error('Exceção ao buscar comentários:', error);
    return [];
  }
};

/**
 * Cria um novo comentário
 */
export const createComment = async (comment: {
  postId: string;
  content: string;
  author: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string;
  userId: string;
}): Promise<BlogComment> => {
  try {
    // Verificar se a tabela existe antes de tentar inserir
    const { error: checkError } = await supabase
      .from('blog_comments')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.error('Tabela de comentários não existe:', checkError);
      // Retornar um comentário simulado se a tabela não existir
      return {
        id: 'temp-' + Date.now(),
        postId: comment.postId,
        content: comment.content,
        author: comment.author,
        authorId: comment.authorId,
        authorName: comment.authorName,
        authorAvatar: comment.authorAvatar,
        likesCount: 0,
        parentId: comment.parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
        userId: comment.userId,
        isLiked: false
      };
    }

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: comment.postId,
        user_id: comment.userId,
        content: comment.content,
        author_name: comment.authorName,
        author_avatar: comment.authorAvatar || null,
        parent_id: comment.parentId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar comentário:', error);
      // Retornar um comentário simulado em caso de erro
      return {
        id: 'temp-' + Date.now(),
        postId: comment.postId,
        content: comment.content,
        author: comment.author,
        authorId: comment.authorId,
        authorName: comment.authorName,
        authorAvatar: comment.authorAvatar,
        likesCount: 0,
        parentId: comment.parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
        userId: comment.userId,
        isLiked: false
      };
    }

    return mapCommentFromSupabase(data);
  } catch (error) {
    console.error('Exceção ao criar comentário:', error);
    // Retornar um comentário simulado em caso de exceção
    return {
      id: 'temp-' + Date.now(),
      postId: comment.postId,
      content: comment.content,
      author: comment.author,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar,
      likesCount: 0,
      parentId: comment.parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      userId: comment.userId,
      isLiked: false
    };
  }
};

/**
 * Atualiza um comentário existente
 */
export const updateComment = async (id: string, content: string): Promise<BlogComment> => {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar comentário:', error);
      throw error;
    }

    return mapCommentFromSupabase(data);
  } catch (error) {
    console.error('Exceção ao atualizar comentário:', error);
    throw error;
  }
};

/**
 * Exclui um comentário
 */
export const deleteComment = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir comentário:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exceção ao excluir comentário:', error);
    throw error;
  }
};

/**
 * Incrementa o número de curtidas de um comentário
 */
export const incrementCommentLikes = async (commentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .rpc('increment_comment_likes', { comment_id: commentId });

    if (error) {
      console.error('Erro ao incrementar curtidas do comentário:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exceção ao incrementar curtidas do comentário:', error);
    throw error;
  }
};

/**
 * Verifica se o usuário atual pode editar ou excluir um comentário
 */
export const canModifyComment = (userId: string, commentUserId: string): boolean => {
  return userId === commentUserId;
};
