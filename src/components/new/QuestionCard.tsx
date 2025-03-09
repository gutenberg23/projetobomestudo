"use client";

import React, { useState, useEffect } from "react";
import type { Question } from "./types";
import { QuestionHeader } from "./question/QuestionHeader";
import { QuestionOption } from "./question/QuestionOption";
import { QuestionComment } from "./question/QuestionComment";
import { QuestionFooter } from "./question/QuestionFooter";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface QuestionCardProps {
  question: Question;
  disabledOptions: string[];
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  disabledOptions,
  onToggleDisabled
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showOfficialAnswer, setShowOfficialAnswer] = useState(false);
  const [showAIAnswer, setShowAIAnswer] = useState(false);
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showExpandedContent, setShowExpandedContent] = useState(false);
  const [comments, setComments] = useState<Array<any>>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [alreadyLikedIds, setAlreadyLikedIds] = useState<string[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { simuladoId } = useParams<{ simuladoId: string }>();
  
  // Verificar se há conteúdo adicional para mostrar (imagens, textos longos, etc.)
  const hasExpandableContent = question.additionalContent || question.images?.length > 0;
  
  // Obter o usuário atual
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Buscar nome do usuário
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nome')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setUserName(profileData.nome);
        }
        
        // Verificar se já respondeu esta questão
        const { data: respostaData } = await supabase
          .from('respostas_alunos')
          .select('*')
          .eq('questao_id', question.id)
          .eq('aluno_id', user.id);
          
        if (respostaData && respostaData.length > 0) {
          setHasAnswered(true);
        }
        
        // Verificar quais comentários já foram curtidos pelo usuário
        const { data: likesData } = await supabase
          .from('likes_comentarios')
          .select('comentario_id')
          .eq('usuario_id', user.id);
          
        if (likesData && likesData.length > 0) {
          setAlreadyLikedIds(likesData.map(like => like.comentario_id));
          setLikedComments(likesData.map(like => like.comentario_id));
        }
      }
    };
    
    getUserData();
  }, [question.id]);
  
  // Buscar comentários da questão
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comentarios_questoes')
        .select(`
          id,
          conteudo,
          created_at,
          usuario_id,
          profiles (nome, foto_perfil),
          likes_comentarios (id)
        `)
        .eq('questao_id', question.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao buscar comentários:", error);
        return;
      }
      
      if (data) {
        // Formatar comentários para o formato esperado pelo componente
        const formattedComments = data.map(comment => ({
          id: comment.id,
          author: comment.profiles?.nome || "Usuário",
          avatar: comment.profiles?.foto_perfil || "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
          content: comment.conteudo,
          timestamp: new Date(comment.created_at).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          likes: comment.likes_comentarios ? comment.likes_comentarios.length : 0,
          userId: comment.usuario_id
        }));
        
        setComments(formattedComments);
      }
    };
    
    if (showComments) {
      fetchComments();
    }
  }, [question.id, showComments, likedComments]);
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  const toggleAnswer = async () => {
    if (!showAnswer && !hasAnswered && selectedOption !== null) {
      // Verificar se a opção selecionada é a correta
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctOption?.id === selectedOption;
      
      try {
        setIsSubmittingAnswer(true);
        
        // Registrar a resposta do aluno
        if (userId) {
          const { error } = await supabase
            .from('respostas_alunos')
            .insert({
              aluno_id: userId,
              questao_id: question.id,
              opcao_id: selectedOption,
              is_correta: isCorrect
            });
            
          if (error) throw error;
          
          setHasAnswered(true);
        }
      } catch (error) {
        console.error("Erro ao registrar resposta:", error);
        toast.error("Erro ao registrar resposta. Tente novamente.");
      } finally {
        setIsSubmittingAnswer(false);
      }
    }
    
    setShowAnswer(!showAnswer);
  };
  
  const toggleOfficialAnswer = () => {
    setShowOfficialAnswer(!showOfficialAnswer);
  };
  
  const toggleAIAnswer = () => {
    setShowAIAnswer(!showAIAnswer);
  };
  
  const toggleExpandedContent = () => {
    setShowExpandedContent(!showExpandedContent);
  };
  
  const toggleLike = async (commentId: string) => {
    if (!userId) {
      toast.error("Você precisa estar logado para curtir comentários.");
      return;
    }
    
    try {
      if (likedComments.includes(commentId)) {
        // Remover o like
        const { error } = await supabase
          .from('likes_comentarios')
          .delete()
          .eq('comentario_id', commentId)
          .eq('usuario_id', userId);
          
        if (error) throw error;
        
        setLikedComments(prev => prev.filter(id => id !== commentId));
      } else {
        // Adicionar o like
        const { error } = await supabase
          .from('likes_comentarios')
          .insert({
            comentario_id: commentId,
            usuario_id: userId
          });
          
        if (error) throw error;
        
        setLikedComments(prev => [...prev, commentId]);
      }
    } catch (error) {
      console.error("Erro ao curtir comentário:", error);
      toast.error("Erro ao curtir comentário. Tente novamente.");
    }
  };
  
  const handleOptionClick = (optionId: string) => {
    if (!disabledOptions.includes(optionId) && !hasAnswered) {
      setSelectedOption(optionId);
    }
  };
  
  const handleToggleDisabled = (optionId: string, event: React.MouseEvent) => {
    if (selectedOption === optionId) {
      setSelectedOption(null);
    }
    onToggleDisabled(optionId, event);
  };
  
  const handleSubmitComment = async () => {
    if (comment.trim() === "") return;
    
    if (!userId) {
      toast.error("Você precisa estar logado para comentar.");
      return;
    }
    
    try {
      setSubmittingComment(true);
      
      const { error } = await supabase
        .from('comentarios_questoes')
        .insert({
          questao_id: question.id,
          usuario_id: userId,
          conteudo: comment
        });
        
      if (error) throw error;
      
      // Adicionar o novo comentário à lista
      const newComment = {
        id: Date.now().toString(), // Temporário até atualizar
        author: userName || "Usuário",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: comment,
        timestamp: new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        likes: 0,
        userId
      };
      
      setComments(prev => [newComment, ...prev]);
      setComment("");
      toast.success("Comentário enviado com sucesso!");
      
      // Recarregar comentários para obter o ID correto
      const { data } = await supabase
        .from('comentarios_questoes')
        .select(`
          id,
          conteudo,
          created_at,
          usuario_id,
          profiles (nome, foto_perfil),
          likes_comentarios (id)
        `)
        .eq('questao_id', question.id)
        .order('created_at', { ascending: false });
        
      if (data) {
        const formattedComments = data.map(comment => ({
          id: comment.id,
          author: comment.profiles?.nome || "Usuário",
          avatar: comment.profiles?.foto_perfil || "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
          content: comment.conteudo,
          timestamp: new Date(comment.created_at).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          likes: comment.likes_comentarios ? comment.likes_comentarios.length : 0,
          userId: comment.usuario_id
        }));
        
        setComments(formattedComments);
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      toast.error("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setSubmittingComment(false);
    }
  };
  
  return <article className="w-full rounded-xl border border-solid border-gray-100 mb-5 bg-white">
      <header className="overflow-hidden rounded-t-xl rounded-b-none border-b border-gray-100">
        <QuestionHeader 
          year={question.year} 
          institution={question.institution} 
          organization={question.organization} 
          role={question.role} 
          id={question.id} 
        />
      </header>

      <div className="flex gap-2.5 items-start px-3 md:px-5 py-2.5 w-full text-base text-slate-800">
        <div className="flex flex-1 shrink gap-2.5 items-start px-2.5 py-5 w-full rounded-md basis-0 min-w-60 ">
          {hasExpandableContent && (
            <button 
              onClick={toggleExpandedContent} 
              className="flex items-center justify-center p-1 text-[#67748a] hover:text-[#5f2ebe] transition-colors focus:outline-none"
              aria-label={showExpandedContent ? "Recolher conteúdo adicional" : "Expandir conteúdo adicional"}
            >
              {showExpandedContent ? (
                <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>
          )}
          
          <div className="flex-1">
            {hasExpandableContent && showExpandedContent && (
              <div className="mb-4 border-b border-gray-100 pb-4">
                {question.images && question.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`Imagem ${index + 1} da questão ${question.id}`} 
                        className="max-w-full h-auto rounded-md"
                      />
                    ))}
                  </div>
                )}
                
                {question.additionalContent && (
                  <div 
                    className="text-[#67748a] text-sm md:text-base"
                    dangerouslySetInnerHTML={{ __html: question.additionalContent }}
                  />
                )}
              </div>
            )}
            
            <p 
              className="text-left text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />
          </div>
        </div>
      </div>

      {question.options.map((option, index) => (
        <QuestionOption 
          key={option.id} 
          id={option.id} 
          text={option.text} 
          index={index} 
          isDisabled={disabledOptions.includes(option.id)} 
          isSelected={selectedOption === option.id} 
          isCorrect={Boolean(option.isCorrect)} 
          onToggleDisabled={handleToggleDisabled} 
          onSelect={handleOptionClick} 
          showAnswer={showAnswer} 
        />
      ))}

      <QuestionFooter 
        commentsCount={comments.length} 
        showComments={showComments} 
        showAnswer={showAnswer} 
        showOfficialAnswer={showOfficialAnswer}
        showAIAnswer={showAIAnswer}
        onToggleComments={toggleComments} 
        onToggleAnswer={toggleAnswer} 
        onToggleOfficialAnswer={toggleOfficialAnswer}
        onToggleAIAnswer={toggleAIAnswer}
        hasSelectedOption={selectedOption !== null} 
        hasTeacherExplanation={Boolean(question.teacherExplanation)}
        hasAIExplanation={Boolean(question.aiExplanation)}
        isSubmittingAnswer={isSubmittingAnswer}
      />

      {showOfficialAnswer && question.teacherExplanation && (
        <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment 
            comment={{
              id: `teacher-${question.id}`,
              author: "Professor",
              avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
              content: question.teacherExplanation,
              timestamp: "Gabarito oficial",
              likes: 0
            }} 
            isLiked={likedComments.includes(`teacher-${question.id}`)} 
            onToggleLike={toggleLike} 
          />
        </section>
      )}

      {showAIAnswer && question.aiExplanation && (
        <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment 
            comment={{
              id: `ai-${question.id}`,
              author: "BIA (BomEstudo IA)",
              avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
              content: question.aiExplanation,
              timestamp: "Resposta da IA",
              likes: 0
            }} 
            isLiked={likedComments.includes(`ai-${question.id}`)} 
            onToggleLike={toggleLike} 
          />
        </section>
      )}

      {showComments && (
        <section className="py-3 md:py-5 w-full border-t border-gray-100">
          {comments.map(comment => (
            <QuestionComment 
              key={comment.id} 
              comment={comment} 
              isLiked={likedComments.includes(comment.id)} 
              onToggleLike={toggleLike} 
            />
          ))}

          <div className="flex justify-center items-center px-2 md:px-12 py-1.5 mt-2.5 w-full text-sm md:text-base leading-none text-slate-800 gap-2">
            <div className="flex overflow-hidden flex-1 shrink justify-center items-start w-full basis-0 min-w-0">
              <input 
                type="text" 
                placeholder="Escreva uma mensagem" 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                className="overflow-hidden flex-1 shrink p-2 md:p-2.5 w-full rounded-3xl basis-0 min-w-0 border border-purple-300 focus:border-purple-500 focus:outline-none text-sm md:text-base" 
              />
            </div>
            <button 
              onClick={handleSubmitComment} 
              className="p-2 md:p-2.5 rounded-full hover:bg-purple-50 flex-shrink-0"
              disabled={submittingComment || comment.trim() === ""}
            >
              <Send className={`w-4 h-4 md:w-5 md:h-5 ${submittingComment ? 'text-gray-400' : 'text-purple-500'}`} />
            </button>
          </div>
        </section>
      )}
    </article>;
};
