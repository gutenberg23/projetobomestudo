"use client";

import React, { useState, useEffect } from "react";
import type { Question, QuestionBook } from "./types";
import { QuestionHeader } from "./question/QuestionHeader";
import { QuestionOption } from "./question/QuestionOption";
import { QuestionComment } from "./question/QuestionComment";
import { QuestionFooter } from "./question/QuestionFooter";
import { Send, ChevronUp, BookPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Declarar o tipo global
declare global {
  interface Window {
    handleQuestionAnswer?: (isCorrect: boolean) => void;
  }
}

interface QuestionCardProps {
  question: Question;
  disabledOptions: string[];
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
  onRemove?: (questionId: string) => Promise<void>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  disabledOptions,
  onToggleDisabled,
  onRemove
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
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [openAddToBook, setOpenAddToBook] = useState(false);
  const [books, setBooks] = useState<QuestionBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookType, setNewBookType] = useState<'public' | 'private'>('private');
  const [showStats, setShowStats] = useState(false);

  // Verificar se há conteúdo expansível
  const hasExpandableContent = Boolean(question.expandableContent);

  // Resetar o estado quando a questão muda
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    setShowOfficialAnswer(false);
    setShowAIAnswer(false);

    // Verificar novamente se o usuário já respondeu esta nova questão
    const checkUserAnswer = async () => {
      if (userId) {
        try {
          const {
            data: respostaData
          } = await supabase.from('respostas_alunos').select('*').eq('questao_id', question.id).eq('aluno_id', userId);
          if (respostaData && respostaData.length > 0) {
            setHasAnswered(true);

            // Não selecionamos automaticamente nenhuma opção para permitir
            // que o usuário responda novamente
          } else {
            setHasAnswered(false);
          }
        } catch (error) {
          console.error("Erro ao verificar resposta do usuário:", error);
        }
      }
    };
    checkUserAnswer();
  }, [question.id, userId]);

  // Obter o usuário atual
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Verificar se já respondeu esta questão
        const {
          data: respostaData
        } = await supabase.from('respostas_alunos').select('*').eq('questao_id', question.id).eq('aluno_id', user.id);
        if (respostaData && respostaData.length > 0) {
          setHasAnswered(true);
          // Não selecionamos automaticamente nenhuma opção para permitir
          // que o usuário responda novamente
        }

        // Verificar quais comentários já foram curtidos pelo usuário
        const {
          data: likesData
        } = await supabase.from('likes_comentarios').select('comentario_id').eq('usuario_id', user.id);
        if (likesData && likesData.length > 0) {
          setLikedComments(likesData.map(like => like.comentario_id));
        }
      }
    };
    getUserData();
  }, [question.id]);

  // Buscar contagem de comentários independente de mostrar ou não os comentários
  useEffect(() => {
    const fetchCommentsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('comentarios_questoes')
          .select('id', { count: 'exact', head: true })
          .eq('questao_id', question.id);
          
        if (error) {
          console.error("Erro ao buscar contagem de comentários:", error);
          return;
        }
        
        setCommentsCount(count || 0);
      } catch (error) {
        console.error("Erro ao processar contagem de comentários:", error);
      }
    };
    
    fetchCommentsCount();
  }, [question.id]);

  // Buscar comentários da questão
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Primeiro buscar os comentários
        const { data: commentsData, error, count } = await supabase
          .from('comentarios_questoes')
          .select(`
            id,
            conteudo,
            created_at,
            usuario_id,
            questao_id
          `, { count: 'exact' })
          .eq('questao_id', question.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erro ao buscar comentários:", error);
          return;
        }

        // Atualizar a contagem sempre que carregar os comentários completos
        if (count !== null) {
          setCommentsCount(count);
        }

        if (commentsData && commentsData.length > 0) {
          // Para cada comentário, buscar os dados do perfil do usuário e os likes separadamente
          const formattedComments = await Promise.all(commentsData.map(async (comment) => {
            // Buscar dados do perfil separadamente
            const { data: profileData } = await supabase
              .from('profiles')
              .select('nome, foto_perfil')
              .eq('id', comment.usuario_id)
              .single();

            // Buscar likes do comentário
            const { data: likesData, error: likesError } = await supabase
              .from('likes_comentarios')
              .select('id')
              .eq('comentario_id', comment.id);

            if (likesError) {
              console.error("Erro ao buscar likes:", likesError);
            }

            // Usar a foto do perfil ou fallback para o avatar padrão
            const userAvatar = profileData?.foto_perfil || 
                             "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0";

            return {
              id: comment.id,
              author: profileData?.nome || "Usuário",
              avatar: userAvatar,
              content: comment.conteudo,
              timestamp: new Date(comment.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              likes: likesData ? likesData.length : 0,
              userId: comment.usuario_id
            };
          }));
          setComments(formattedComments);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Erro ao processar comentários:", error);
        setComments([]);
      }
    };
    if (showComments) {
      fetchComments();
    }
  }, [question.id, showComments]);

  useEffect(() => {
    if (openAddToBook) {
      fetchBooks();
    }
  }, [openAddToBook]);

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para ver seus cadernos');
        return;
      }

      const { data, error } = await supabase
        .from('cadernos_questoes')
        .select('id, nome, user_id, is_public, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar cadernos:', error);
      toast.error('Erro ao carregar os cadernos');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleCreateBook = async () => {
    try {
      if (!newBookTitle.trim()) {
        toast.error('O título é obrigatório');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para criar um caderno');
        return;
      }

      const { data, error } = await supabase
        .from('cadernos_questoes')
        .insert({
          nome: newBookTitle.trim(),
          user_id: user.id,
          is_public: newBookType === 'public'
        })
        .select('id, nome, user_id, is_public, created_at, updated_at')
        .single();

      if (error) throw error;

      setBooks(prev => [data, ...prev]);
      setSelectedBookId(data.id);
      setCreatingBook(false);
      setNewBookTitle('');
      setNewBookType('private');
      toast.success('Caderno criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar caderno:', error);
      toast.error('Erro ao criar o caderno');
    }
  };

  const handleAddToBook = async () => {
    try {
      if (!selectedBookId) {
        toast.error('Selecione um caderno');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para adicionar questões');
        return;
      }

      // Verifica se a questão já existe no caderno
      const { data: existingQuestion, error: checkError } = await supabase
        .from('questoes_caderno')
        .select('*')
        .eq('caderno_id', selectedBookId)
        .eq('questao_id', question.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingQuestion) {
        toast.error('Esta questão já está no caderno');
        return;
      }

      // Adiciona a questão ao caderno
      const { error: insertError } = await supabase
        .from('questoes_caderno')
        .insert({
          caderno_id: selectedBookId,
          questao_id: question.id,
          user_id: user.id
        });

      if (insertError) throw insertError;

      setOpenAddToBook(false);
      setSelectedBookId('');
      toast.success('Questão adicionada ao caderno!');
    } catch (error) {
      console.error('Erro ao adicionar questão:', error);
      toast.error('Erro ao adicionar questão ao caderno');
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };
  const handleAnswer = async () => {
    if (selectedOption !== null) {
      // Verificar se a opção selecionada é a correta
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctOption?.id === selectedOption;

      try {
        setIsSubmittingAnswer(true);

        // Atualizar o contador
        if (window.handleQuestionAnswer) {
          window.handleQuestionAnswer(isCorrect);
        }

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
          setShowAnswer(true);
        }
      } catch (error) {
        console.error("Erro ao registrar resposta:", error);
        toast.error("Erro ao registrar resposta. Tente novamente.");
      } finally {
        setIsSubmittingAnswer(false);
      }
    }
  };
  const toggleStats = () => {
    setShowStats(!showStats);
  };
  const toggleOfficialAnswer = () => {
    setShowOfficialAnswer(!showOfficialAnswer);
  };
  const toggleAIAnswer = () => {
    setShowAIAnswer(!showAIAnswer);
  };
  const toggleLike = async (commentId: string) => {
    if (!userId) {
      toast.error("Você precisa estar logado para curtir comentários.");
      return;
    }
    try {
      // Verificar se já está nos likes (interface)
      const isLiked = likedComments.includes(commentId);
      if (isLiked) {
        // Remover o like - buscar o ID do like para deletar corretamente
        const { data, error: findError } = await supabase
          .from('likes_comentarios')
          .select('id')
          .eq('comentario_id', commentId)
          .eq('usuario_id', userId)
          .single();
        
        if (findError) throw findError;
        
        if (data && data.id) {
          const { error } = await supabase
            .from('likes_comentarios')
            .delete()
            .eq('id', data.id);
            
          if (error) throw error;

          // Atualizar estado local
          setLikedComments(prev => prev.filter(id => id !== commentId));
          setComments(prevComments => {
            return prevComments.map(c => {
              if (c.id === commentId) {
                return {
                  ...c,
                  likes: Math.max(0, c.likes - 1)
                };
              }
              return c;
            });
          });
        }
      } else {
        // Adicionar o like
        const { error } = await supabase
          .from('likes_comentarios')
          .insert({
            comentario_id: commentId,
            usuario_id: userId
          });
          
        if (error) throw error;

        // Atualizar estado local
        setLikedComments(prev => [...prev, commentId]);
        setComments(prevComments => {
          return prevComments.map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                likes: c.likes + 1
              };
            }
            return c;
          });
        });
      }
    } catch (error) {
      console.error("Erro ao curtir comentário:", error);
      toast.error("Erro ao curtir comentário. Tente novamente.");
    }
  };
  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
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
      
      // Buscar dados do perfil do usuário primeiro
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nome, foto_perfil')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Usar a foto do perfil ou fallback para o avatar padrão
      const userAvatar = profileData.foto_perfil || 
                        "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0";

      const { data: newComment, error } = await supabase
        .from('comentarios_questoes')
        .insert({
          questao_id: question.id,
          usuario_id: userId,
          conteudo: comment
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar o novo comentário à lista com os dados do perfil
      if (newComment) {
        const newCommentWithProfile = {
          id: newComment.id,
          author: profileData.nome || "Usuário",
          avatar: userAvatar,
          content: newComment.conteudo,
          timestamp: new Date(newComment.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          likes: 0,
          userId
        };
        setComments(prev => [newCommentWithProfile, ...prev]);
        setCommentsCount(prev => prev + 1);
        setComment("");
        toast.success("Comentário enviado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      toast.error("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setSubmittingComment(false);
    }
  };
  return (
    <div className="w-full bg-white rounded-lg shadow-md mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <QuestionHeader
            questionNumber={question.number}
            year={question.year || ""}
            institution={question.institution || ""}
            organization={question.organization || ""}
            role={question.role || ""}
            educationLevel={question.educationLevel || ""}
            discipline={question.discipline || ""}
            topics={question.topics || []}
            questionId={question.id}
          />
        </div>
      </div>

      {/* Conteúdo expandível */}
      {hasExpandableContent && (
        <div className="mt-6 mb-2 px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExpandedContent(!showExpandedContent)}
              className="flex items-center justify-start p-1 text-[#5f2ebe] hover:text-[#5f2ebe]/80 transition-colors focus:outline-none"
              aria-label={showExpandedContent ? "Recolher conteúdo adicional" : "Expandir conteúdo adicional"}
            >
              <span className="mr-1">Conteúdo relacionado à questão</span>
              {showExpandedContent ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5" /> : <span className="text-lg font-bold">+</span>}
            </button>
            {hasAnswered && (
              <Badge variant="secondary" className="text-white bg-slate-300">
                Você já respondeu
              </Badge>
            )}
          </div>
          {showExpandedContent && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg" dangerouslySetInnerHTML={{ __html: question.expandableContent || '' }} />
          )}
        </div>
      )}

      {/* Conteúdo da questão */}
      <div className="flex gap-2.5 items-start px-3 md:px-5 py-2.5 w-full text-base text-slate-800">
        <div className="flex flex-col w-full px-2.5 py-5 rounded-md relative">
          <p className="text-left text-sm md:text-base" dangerouslySetInnerHTML={{
            __html: question.content
          }} />
        </div>
      </div>

      {/* Comando da questão */}
      {question.command && (
        <div className="mb-4 px-4 text-gray-700" dangerouslySetInnerHTML={{ __html: question.command }} />
      )}

      {question.options.map((option, index) => <QuestionOption key={option.id} id={option.id} text={option.text} index={index} isDisabled={disabledOptions.includes(option.id)} isSelected={selectedOption === option.id} isCorrect={Boolean(option.isCorrect)} onToggleDisabled={handleToggleDisabled} onSelect={handleOptionClick} showAnswer={showAnswer} />)}

      <div className="flex justify-start px-4 mt-4 mb-4">
        <Button
          onClick={handleAnswer}
          disabled={!selectedOption || isSubmittingAnswer}
          className={`px-8 py-2 rounded-full font-medium ${
            !selectedOption || isSubmittingAnswer
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isSubmittingAnswer ? "Enviando..." : "Responder"}
        </Button>
      </div>

      <QuestionFooter 
        commentsCount={commentsCount} 
        showComments={showComments} 
        showAnswer={showAnswer} 
        showStats={showStats}
        showOfficialAnswer={showOfficialAnswer} 
        showAIAnswer={showAIAnswer} 
        onToggleComments={toggleComments} 
        onToggleAnswer={toggleStats}
        onToggleOfficialAnswer={toggleOfficialAnswer} 
        onToggleAIAnswer={toggleAIAnswer} 
        hasSelectedOption={selectedOption !== null} 
        hasTeacherExplanation={Boolean(question.teacherExplanation)} 
        hasAIExplanation={Boolean(question.aiExplanation)} 
        isSubmittingAnswer={isSubmittingAnswer}
        onRemove={onRemove ? () => onRemove(question.id) : undefined}
        addToBookDialog={
          <Dialog open={openAddToBook} onOpenChange={setOpenAddToBook}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
              >
                <BookPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar ao Caderno</DialogTitle>
                <DialogDescription>
                  Selecione um caderno para adicionar esta questão
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {loadingBooks ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                  </div>
                ) : books.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Você ainda não tem nenhum caderno.</p>
                    <Button
                      variant="link"
                      onClick={() => setCreatingBook(true)}
                      className="mt-2"
                    >
                      Criar novo caderno
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Caderno
                      </label>
                      <Select
                        value={selectedBookId}
                        onValueChange={setSelectedBookId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um caderno" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map((book) => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="link"
                      onClick={() => setCreatingBook(true)}
                      className="px-0"
                    >
                      Ou criar novo caderno
                    </Button>
                  </>
                )}

                {creatingBook && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nome do Novo Caderno
                      </label>
                      <Input
                        placeholder="Digite o nome do caderno"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Tipo
                      </label>
                      <Select
                        value={newBookType}
                        onValueChange={(value: 'public' | 'private') => setNewBookType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Privado</SelectItem>
                          <SelectItem value="public">Público</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCreatingBook(false);
                          setNewBookTitle('');
                          setNewBookType('private');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateBook}>
                        Criar Caderno
                      </Button>
                    </div>
                  </div>
                )}

                {!creatingBook && (books.length > 0 || selectedBookId) && (
                  <div className="flex justify-end">
                    <Button onClick={handleAddToBook}>
                      Adicionar ao Caderno
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {showOfficialAnswer && question.teacherExplanation && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: `teacher-${question.id}`,
        author: "Professor",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: question.teacherExplanation,
        timestamp: "Gabarito oficial",
        likes: 0
      }} isLiked={likedComments.includes(`teacher-${question.id}`)} onToggleLike={toggleLike} />
        </section>}

      {showAIAnswer && question.aiExplanation && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: `ai-${question.id}`,
        author: "BIA (BomEstudo IA)",
        avatar: "https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/53bd675aced9cd35bef2bdde64d667b38352b92776785d91dc81b5813eb0aba0",
        content: question.aiExplanation,
        timestamp: "Resposta da IA",
        likes: 0
      }} isLiked={likedComments.includes(`ai-${question.id}`)} onToggleLike={toggleLike} />
        </section>}

      {showComments && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          {comments.map(comment => <QuestionComment key={comment.id} comment={comment} isLiked={likedComments.includes(comment.id)} onToggleLike={toggleLike} />)}

          <div className="flex justify-center items-center px-2 md:px-12 py-1.5 mt-2.5 w-full text-sm md:text-base leading-none text-slate-800 gap-2">
            <div className="flex overflow-hidden flex-1 shrink justify-center items-start w-full basis-0 min-w-0">
              <input type="text" placeholder="Escreva uma mensagem" value={comment} onChange={e => setComment(e.target.value)} className="overflow-hidden flex-1 shrink p-2 md:p-2.5 w-full rounded-3xl basis-0 min-w-0 border border-purple-300 focus:border-purple-500 focus:outline-none text-sm md:text-base" />
            </div>
            <button onClick={handleSubmitComment} className="p-2 md:p-2.5 rounded-full hover:bg-purple-50 flex-shrink-0" disabled={submittingComment || comment.trim() === ""}>
              <Send className={`w-4 h-4 md:w-5 md:h-5 ${submittingComment ? 'text-gray-400' : 'text-purple-500'}`} />
            </button>
          </div>
        </section>}
    </div>
  );
};