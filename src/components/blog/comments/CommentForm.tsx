import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createComment } from '@/services/commentService';
import { BlogComment } from '@/components/blog/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { incrementComments } from '@/services/blogService';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  authorName?: string;
  authorAvatar?: string;
  onCommentAdded?: (comment: BlogComment) => void;
  onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
  postId, 
  parentId, 
  authorName,
  authorAvatar,
  onCommentAdded,
  onCancel 
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva algo antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newComment = await createComment({
        postId,
        content: content.trim(),
        author: user.user_metadata?.name || 'Usuário',
        authorId: user.id,
        authorAvatar: authorAvatar || user.user_metadata?.avatar_url,
        parentId,
        authorName: authorName || user.user_metadata?.name || 'Usuário',
        userId: user.id
      });

      // Se for um comentário principal (não uma resposta), incrementar a contagem de comentários do post
      if (!parentId) {
        await incrementComments(postId);
      }

      setContent('');
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
      
      toast({
        title: parentId ? "Resposta adicionada" : "Comentário adicionado",
        description: parentId 
          ? "Sua resposta foi publicada com sucesso." 
          : "Seu comentário foi publicado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar seu comentário. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Escreva sua resposta..." : "Deixe seu comentário..."}
          className="w-full p-3 focus:outline-none resize-none"
          style={{ height: '100px' }}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Enviando...' : parentId ? 'Responder' : 'Comentar'}
        </Button>
      </div>
    </form>
  );
};
