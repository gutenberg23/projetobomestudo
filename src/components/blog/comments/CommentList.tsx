import React, { useState, useEffect } from 'react';
import { BlogComment } from '@/components/blog/types';
import { fetchCommentsByPostId } from '@/services/commentService';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentListProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentList: React.FC<CommentListProps> = ({ 
  postId,
  onCommentCountChange 
}) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Função para calcular o número total de comentários (incluindo respostas)
  const calculateTotalComments = (commentList: BlogComment[]): number => {
    return commentList.reduce((total, comment) => {
      // Contar o comentário atual
      let count = 1;
      // Adicionar o número de respostas, se houver
      if (comment.replies && comment.replies.length > 0) {
        count += comment.replies.length;
      }
      return total + count;
    }, 0);
  };

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const fetchedComments = await fetchCommentsByPostId(postId);
        setComments(fetchedComments);
        
        // Atualizar a contagem de comentários
        if (onCommentCountChange) {
          const totalCount = calculateTotalComments(fetchedComments);
          onCommentCountChange(totalCount);
        }
        
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        setError('Não foi possível carregar os comentários.');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId, onCommentCountChange]);

  const handleCommentAdded = (newComment: BlogComment) => {
    if (newComment.parentId) {
      // Se for uma resposta, adicionar à lista de respostas do comentário pai
      setComments(prev => prev.map(comment => 
        comment.id === newComment.parentId 
          ? { 
              ...comment, 
              replies: [...(comment.replies || []), newComment] 
            }
          : comment
      ));
    } else {
      // Se for um comentário novo, adicionar à lista principal
      setComments(prev => [...prev, { ...newComment, replies: [] }]);
    }
    
    // Atualizar a contagem de comentários
    if (onCommentCountChange) {
      onCommentCountChange(calculateTotalComments([...comments, newComment]));
    }
  };

  const handleCommentUpdated = (updatedComment: BlogComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === updatedComment.id 
          ? { ...updatedComment, replies: comment.replies } 
          : comment.replies?.some(reply => reply.id === updatedComment.id)
            ? { 
                ...comment, 
                replies: comment.replies.map(reply => 
                  reply.id === updatedComment.id ? updatedComment : reply
                ) 
              }
            : comment
      )
    );
  };

  const handleCommentDeleted = (commentId: string, parentId?: string) => {
    if (parentId) {
      // Se for uma resposta, remover da lista de respostas do comentário pai
      setComments(prev => 
        prev.map(comment => 
          comment.id === parentId 
            ? { 
                ...comment, 
                replies: comment.replies?.filter(reply => reply.id !== commentId) || [] 
              }
            : comment
        )
      );
    } else {
      // Se for um comentário principal, remover da lista principal
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    }
    
    // Atualizar a contagem de comentários após a exclusão
    if (onCommentCountChange) {
      const updatedComments = parentId 
        ? comments.map(comment => 
            comment.id === parentId 
              ? { 
                  ...comment, 
                  replies: comment.replies?.filter(reply => reply.id !== commentId) || [] 
                }
              : comment
          )
        : comments.filter(comment => comment.id !== commentId);
      
      onCommentCountChange(calculateTotalComments(updatedComments));
    }
  };

  // Renderização com posicionamento absoluto para evitar tremidas
  return (
    <div className="relative" style={{ minHeight: '400px' }}>
      {/* Área do formulário de comentário - sempre visível */}
      <div className="mb-8">
        {user ? (
          <div>
            <h3 className="text-lg font-medium mb-4">Deixe seu comentário</h3>
            <CommentForm 
              postId={postId} 
              onCommentAdded={handleCommentAdded} 
            />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-600">
              Faça login para deixar um comentário
            </p>
          </div>
        )}
      </div>
      
      {/* Área de comentários */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Nenhum comentário ainda</p>
            <p className="text-sm text-gray-400">
              Seja o primeiro a comentar!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onUpdate={handleCommentUpdated}
                onDelete={handleCommentDeleted}
                onReply={handleCommentAdded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
