
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CommentFormProps {
  postId: string;
  onSubmit: (comment: string) => Promise<void>;
}

export const CommentForm: React.FC<CommentFormProps> = ({ postId, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const user = session?.user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Erro",
        description: "O comentário não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment("");
      toast({
        title: "Comentário enviado",
        description: "Seu comentário foi enviado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o comentário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-4 rounded-md shadow-sm">
        <p className="text-center text-[#67748a]">
          Faça login para comentar neste post.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
          <AvatarFallback>
            {user.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Escreva seu comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none mb-2"
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !comment.trim()}
              className="bg-[#5f2ebe] hover:bg-[#4a1fb0]"
            >
              {isSubmitting ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
