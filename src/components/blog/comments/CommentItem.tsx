
import React, { useState } from 'react';
import { BlogComment } from '@/components/blog/types';
import { CommentForm } from './CommentForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Heart, Reply, Edit, Trash2, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { createComment, updateComment, deleteComment, incrementCommentLikes, canModifyComment } from '@/services/commentService';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: BlogComment;
  onUpdate: (comment: BlogComment) => void;
  onDelete: (commentId: string, parentId?: string) => void;
  onReply: (comment: BlogComment) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onUpdate, 
  onDelete,
  onReply
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const { user } = useAuth();

  const formattedDate = format(new Date(comment.createdAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  const isEdited = comment.createdAt !== comment.updatedAt;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir comentários",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLiked(true);
      await incrementCommentLikes(comment.id);
      onUpdate({
        ...comment,
        likesCount: comment.likesCount + 1,
        isLiked: true
      });
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      setIsLiked(false);
      toast({
        title: "Erro ao curtir",
        description: "Não foi possível curtir este comentário",
        variant: "destructive"
      });
    }
  };

  const handleReply = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para responder a comentários",
        variant: "destructive"
      });
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Conteúdo vazio",
        description: "O comentário não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedComment = await updateComment(comment.id, editContent);
      onUpdate({
        ...updatedComment,
        replies: comment.replies,
        isLiked
      });
      setIsEditing(false);
      toast({
        title: "Comentário atualizado",
        description: "Seu comentário foi atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o comentário",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    try {
      await deleteComment(comment.id);
      onDelete(comment.id, comment.parentId);
      toast({
        title: "Comentário excluído",
        description: "Seu comentário foi excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReply = async (content: string) => {
    if (!user) return;
    
    try {
      const newReply = await createComment({
        postId: comment.postId,
        userId: user.id,
        content,
        authorName: user.email || 'Usuário',
        authorAvatar: user.user_metadata?.avatar_url,
        parentId: comment.id
      });
      
      onReply(newReply);
      setIsReplying(false);
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      throw error;
    }
  };

  const canModify = user && canModifyComment(user.id, comment.userId);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {comment.authorAvatar ? (
            <img 
              src={comment.authorAvatar} 
              alt={comment.authorName} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center">
              <h4 className="font-medium text-[#272f3c]">{comment.authorName}</h4>
              {user && user.id === comment.userId && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Autor</span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formattedDate}
              {isEdited && <span className="ml-2 italic">(editado)</span>}
            </p>
          </div>
        </div>

        {canModify && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3" style={{ minHeight: '120px' }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-[#67748a]" style={{ minHeight: '40px' }}>
          <p>{comment.content}</p>
        </div>
      )}

      <div className="flex items-center mt-4 space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={isLiked}
          className={`flex items-center text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? 'fill-red-500' : ''}`} />
          {comment.likesCount} {comment.likesCount === 1 ? 'curtida' : 'curtidas'}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReply}
          className="flex items-center text-sm text-gray-500"
        >
          <Reply className="h-4 w-4 mr-1.5" />
          Responder
        </Button>
      </div>

      {isReplying && user && (
        <div className="mt-4 pl-6 border-l-2 border-gray-200" style={{ minHeight: '150px' }}>
          <CommentForm 
            postId={comment.postId} 
            parentId={comment.id}
            onSubmit={handleSubmitReply}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
