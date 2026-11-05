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
import { ActivityLogger } from '@/services/activity-logger';
import { useAuth } from '@/contexts/AuthContext';
import { useExigirLogin } from '@/components/auth/LoginObrigatorio';
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
import { useLocation } from "react-router-dom";
import { useQuestionAttempts } from '@/hooks/useQuestionAttempts';
import { prepareHtmlContent } from "@/utils/text-utils";

// Global flag to prevent multiple simultaneous requests to non-existent table
let atualizacoesQuestoesTableExists: boolean | null = null;
let tableCheckInProgress = false;

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
  /** "moderna" é o visual novo da página /questions; as outras telas seguem no padrão. */
  aparencia?: "padrao" | "moderna";
  /** Posição da questão na lista (aparência moderna). */
  numero?: number;
  /** Resultado da última vez que o aluno resolveu esta questão. */
  situacaoAnterior?: "acertou" | "errou" | null;
  onAnswered?: (questionId: string, isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  disabledOptions,
  onToggleDisabled,
  onRemove,
  aparencia = "padrao",
  numero,
  situacaoAnterior,
  onAnswered
}) => {
  const moderna = aparencia === "moderna";
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
  const [hasAnsweredInCurrentSession, setHasAnsweredInCurrentSession] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [openAddToBook, setOpenAddToBook] = useState(false);
  const [books, setBooks] = useState<QuestionBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookType, setNewBookType] = useState<'public' | 'private'>('private');
  const [teacherLikesCount, setTeacherLikesCount] = useState(0);
  const [aiLikesCount, setAILikesCount] = useState(0);
  const [gabaritoAvatar, setGabaritoAvatar] = useState<string>("/default-avatar.png");
  const [hasVerifiedMetadata, setHasVerifiedMetadata] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFixingMetadata, setIsFixingMetadata] = useState(false);
  const [loadedTopics, setLoadedTopics] = useState<string[]>([]);
  
  // Hook para registrar tentativas de questões
  const { recordQuestionAttempt } = useQuestionAttempts();
  
  // Obter a localização atual para verificar se estamos na página de simulados
  const location = useLocation();
  const isSimuladoPage = location.pathname.includes('/simulado');
  const isQuestionsPage = location.pathname.includes('/questions');
  const { user: usuarioLogado } = useAuth();
  const exigirLogin = useExigirLogin();
  
  // Verificar se os botões devem estar visíveis
  const shouldShowButtons = !isSimuladoPage || hasAnswered;

  // Verificar se há conteúdo expansível
  const hasExpandableContent = Boolean(question.expandableContent);

  // Buscar tópicos diretamente do banco de dados caso não estejam disponíveis
  useEffect(() => {
    const fetchTopicsIfNeeded = async () => {
      // Se já temos tópicos, não precisamos buscar
      if (question.topics && question.topics.length > 0) {
        setLoadedTopics(question.topics);
        return;
      }
      
      if (!question.id) return;
      
      try {
        
        const { data, error } = await supabase
          .from('questoes')
          .select('topicos')
          .eq('id', question.id)
          .single();
          
        if (error) {
          console.error("Erro ao buscar tópicos:", error);
          return;
        }
        
        if (data && data.topicos && Array.isArray(data.topicos) && data.topicos.length > 0) {
          setLoadedTopics(data.topicos);
        } else {
          setLoadedTopics([]);
        }
      } catch (err) {
        console.error("Erro ao buscar tópicos da questão:", err);
      }
    };
    
    fetchTopicsIfNeeded();
  }, [question.id, question.topics]);

  // Verificar e atualizar metadados da questão, se necessário
  useEffect(() => {
    const verifyQuestionMetadata = async () => {
      if (!question.id || hasVerifiedMetadata) return;
      
      try {
        // Verificar se a questão tem disciplina e tópicos definidos
        const needsUpdate = (!question.discipline || !question.topics || question.topics.length === 0);
        
        if (needsUpdate) {
          
          // Buscar informações completas da questão do banco de dados
          const { data: questionData, error } = await supabase
            .from('questoes')
            .select('discipline, topicos, assuntos')
            .eq('id', question.id)
            .single();
            
          if (error) {
            console.error("Erro ao buscar metadados completos da questão:", error);
            return;
          }
          
          if (questionData) {
            // Verificar se temos dados mais completos no banco
            const disciplineBD = questionData.discipline || "";
            const topicsBD = questionData.topicos || [];
            const subjectsBD = questionData.assuntos || [];
            
            if (disciplineBD || (topicsBD && topicsBD.length > 0)) {
              
              // Atualizar as questões respondidas que estão faltando metadados
              // Buscar respostas anteriores do usuário para esta questão que possam estar sem metadados
              if (userId) {
                const { data: respostasDesatualizadas, error: respostasError } = await supabase
                  .from('respostas_alunos')
                  .select('*')
                  .eq('questao_id', question.id)
                  .eq('aluno_id', userId)
                  .or('disciplina.is.null,topicos.is.null,disciplina.eq.');
                  
                if (!respostasError && respostasDesatualizadas && respostasDesatualizadas.length > 0) {
                  
                  // Atualizar cada resposta com os metadados corretos
                  for (const resposta of respostasDesatualizadas) {
                    const { error: updateError } = await supabase
                      .from('respostas_alunos')
                      .update({
                        disciplina: disciplineBD || resposta.disciplina || "",
                        topicos: topicsBD?.length > 0 ? topicsBD : (resposta.topicos || []),
                        assuntos: subjectsBD?.length > 0 ? subjectsBD : (resposta.assuntos || [])
                      })
                      .eq('id', resposta.id);
                      
                    if (updateError) {
                      console.error("Erro ao atualizar resposta:", updateError);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao verificar metadados da questão:", error);
      } finally {
        setHasVerifiedMetadata(true);
      }
    };
    
    verifyQuestionMetadata();
  }, [question.id, question.discipline, question.topics, userId, hasVerifiedMetadata]);

  // Resetar o estado quando a questão muda
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    setShowOfficialAnswer(false);
    setShowAIAnswer(false);
    setHasAnsweredInCurrentSession(false); // Resetar estado da sessão atual

    // Log para depuração - verificar se a questão tem tópicos

    // Verificar novamente se o usuário já respondeu esta nova questão
    const checkUserAnswer = async () => {
      if (userId) {
        try {
          const {
            data: respostaData
          } = await supabase.from('respostas_alunos').select('*').eq('questao_id', question.id).eq('aluno_id', userId);
          if (respostaData && respostaData.length > 0) {
            setHasAnswered(true);
            
            // Se estiver na página de simulado e já tiver respondido, mostrar a resposta automaticamente
            if (isSimuladoPage) {
              setShowAnswer(true);
              
              // Tentar selecionar a opção que o usuário escolheu anteriormente
              if (respostaData[0].opcao_id) {
                setSelectedOption(respostaData[0].opcao_id);
              }
            } else {
              // Na página de questões, não mostrar a resposta automaticamente
              setShowAnswer(false);
            }
          } else {
            setHasAnswered(false);
          }
        } catch (error) {
          console.error("Erro ao verificar resposta do usuário:", error);
        }
      }
    };
    checkUserAnswer();
  }, [question.id, userId, isSimuladoPage]);

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
        
        // Verificar se o usuário já respondeu essa questão
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
        
        
        // Verificar quais gabaritos/IA já foram curtidos pelo usuário
        // Usamos o ID completo da questão
        const {
          data: likesGabaritosData
        } = await supabase
          .from('likes_gabaritos')
          .select('questao_id, type')
          .eq('usuario_id', user.id)
          .ilike('questao_id', `${question.id}%`); // Usar ILIKE para pegar tanto IDs parciais quanto completos
        
        
        // Combinar os dois tipos de likes
        const likedCommentIds = likesData?.map(like => like.comentario_id) || [];
        
        // Processar os likes de gabaritos e IA corretamente
        const likedSpecialComments = likesGabaritosData?.map(like => {
          // Se tiver um tipo definido (teacher ou ai), use-o, caso contrário assuma teacher (para compatibilidade)
          const type = like.type || 'teacher';
          // Usar o ID completo da questão
          const fullId = `${type}-${question.id}`;
          return fullId;
        }) || [];
        
        const allLikes = [...likedCommentIds, ...likedSpecialComments];
        
        setLikedComments(allLikes);
      }
    };
    getUserData();
    // Refaz quando a pessoa entra pelo popup de login sem sair da página
  }, [question.id, usuarioLogado?.id]);

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
        const { data: commentsData, error } = await supabase
          .from('comentarios_questoes')
          .select('id,usuario_id,conteudo,created_at')
          .eq('questao_id', question.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erro ao buscar comentários:", error);
          return;
        }

        if (commentsData && commentsData.length > 0) {
          // Para cada comentário, buscar os dados do perfil e likes separadamente
          const formattedComments = await Promise.all(commentsData.map(async (comment: any) => {
            // Buscar perfil do usuário - campos específicos sem espaços
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id,nome,foto_perfil')
              .eq('id', comment.usuario_id)
              .single();

            const userAvatar = profileData?.foto_perfil || "/default-avatar.png";
            const userName = profileData?.nome || "Usuário";

            if (profileError) {
              console.error("Erro ao buscar perfil:", profileError);
            }

            // Buscar total de likes do comentário
            const { data: likesData, error: likesError } = await supabase
              .from('likes_comentarios')
              .select('id')
              .eq('comentario_id', comment.id);

            if (likesError) {
              console.error("Erro ao buscar likes:", likesError);
            }

            return {
              id: comment.id,
              author: userName,
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
          setCommentsCount(commentsData.length);
        } else {
          setComments([]);
          setCommentsCount(0);
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
  
  // Função para normalizar o nome da banca
  const normalizarBanca = (banca: string): string => {
    return banca?.trim() || '';
  };
  
  const handleAnswer = async () => {
    // Se o usuário já respondeu na página de simulado, não permitir nova resposta
    if (isSimuladoPage && hasAnswered) {
      return;
    }

    // Na página de questões, visitante precisa entrar para responder
    if (isQuestionsPage && !usuarioLogado) {
      exigirLogin({ motivo: "responder questões" });
      return;
    }
    
    if (selectedOption !== null) {
      // Verificar se a opção selecionada é a correta
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctOption?.id === selectedOption;

      try {
        setIsSubmittingAnswer(true);
        
        // Mostrar a resposta correta imediatamente após responder
        setShowAnswer(true);

        // Atualizar o contador
        if (window.handleQuestionAnswer) {
          window.handleQuestionAnswer(isCorrect);
        }
        onAnswered?.(question.id, isCorrect);

        // Registrar a resposta do aluno
        if (userId) {
          // Garantir que tenhamos a disciplina, usando fallbacks caso necessário
          const disciplina = question.discipline || "";
          // Usar loadedTopics se disponível, senão usar topics da question
          const topicos = loadedTopics.length > 0 ? loadedTopics : (question.topics || []);
          const banca = normalizarBanca(question.institution || "");
          // Obter assuntos da questão
          const assuntos = question.assuntos || [];
          
          // Verificar se temos os dados necessários
          if (!disciplina) {
            console.error("Disciplina não encontrada para a questão:", question.id);
            toast.error("Não foi possível enviar sua resposta: dados de disciplina ausentes.");
            return;
          }
          
          if (!topicos || topicos.length === 0) {
            // Permitimos continuar, mas logamos o aviso
          }
          

          const { error } = await supabase
            .from('respostas_alunos')
            .insert({
              aluno_id: userId,
              questao_id: question.id,
              opcao_id: selectedOption,
              is_correta: isCorrect,
              topicos: topicos,
              disciplina: disciplina,
              banca: banca,
              assuntos: assuntos
            });
            
          if (error) {
            console.error("Erro detalhado ao registrar resposta:", error);
            throw error;
          }
          
          // Registrar atividade no histórico
          await ActivityLogger.logQuestionAnswer(question.id, {
            question_text: question.content?.substring(0, 100) + "...", // Primeiros 100 caracteres
            discipline: disciplina,
            topic: topicos.length > 0 ? topicos[0] : 'N/A',
            is_correct: isCorrect
          });
          
          // Registrar tentativa na tabela user_question_attempts para o ranking
          await recordQuestionAttempt(userId, question.id, isCorrect);
          
          setHasAnswered(true);
          setHasAnsweredInCurrentSession(true); // Marcar que respondeu na sessão atual
        }
      } catch (error) {
        console.error("Erro ao registrar resposta:", error);
        toast.error("Erro ao registrar resposta. Tente novamente.");
        // Em caso de erro, reverter a exibição da resposta
        setShowAnswer(false);
      } finally {
        setIsSubmittingAnswer(false);
      }
    }
  };
  const toggleOfficialAnswer = () => {
    setShowOfficialAnswer(!showOfficialAnswer);
  };
  const toggleAIAnswer = () => {
    setShowAIAnswer(!showAIAnswer);
  };
  
  const toggleLike = async (commentId: string) => {
    if (!userId) {
      exigirLogin({ motivo: "curtir comentários" });
      return;
    }
    try {
      // Verificar se é um comentário de professor/gabarito ou IA
      const isProfessorOrAI = commentId.startsWith('teacher-') || commentId.startsWith('ai-');
      
      // Verificar se já está nos likes (interface)
      const isLiked = likedComments.includes(commentId);
      
      if (isProfessorOrAI) {
        const type = commentId.startsWith('teacher-') ? 'teacher' : 'ai';
        const questaoId = commentId.substring(type.length + 1); // +1 para o hífen
        
        if (isLiked) {
          // Remover o like
          const { data, error: findError } = await supabase
            .from('likes_gabaritos')
            .select('id')
            .eq('questao_id', questaoId)
            .eq('usuario_id', userId)
            .eq('type', type)
            .single();
          
          if (findError && findError.code !== 'PGRST116') throw findError;
          
          if (data && data.id) {
            const { error } = await supabase
              .from('likes_gabaritos')
              .delete()
              .eq('id', data.id);
              
            if (error) throw error;

            // Atualizar estado local
            setLikedComments(prev => prev.filter(id => id !== commentId));
            
            // Atualizar contadores específicos
            if (type === 'teacher') {
              setTeacherLikesCount(prev => Math.max(0, prev - 1));
            } else if (type === 'ai') {
              setAILikesCount(prev => Math.max(0, prev - 1));
            }
          }
        } else {
          // Verificar se já existe um like antes de tentar adicionar
          const { data: existingLike, error: checkError } = await supabase
            .from('likes_gabaritos')
            .select('id')
            .eq('questao_id', questaoId)
            .eq('usuario_id', userId)
            .eq('type', type)
            .maybeSingle();
            
          if (checkError) throw checkError;
          
          // Se não existir, adicionar o like
          if (!existingLike) {
            const { error } = await supabase
              .from('likes_gabaritos')
              .insert({
                questao_id: questaoId,
                usuario_id: userId,
                type: type
              })
              .select();
              
            if (error) throw error;
            
            // Registrar atividade de curtida
            await ActivityLogger.logCommentLike(`${type}-${questaoId}`);
            
            // Atualizar contadores específicos
            if (type === 'teacher') {
              setTeacherLikesCount(prev => prev + 1);
            } else if (type === 'ai') {
              setAILikesCount(prev => prev + 1);
            }
          }

          // Atualizar estado local
          setLikedComments(prev => [...prev, commentId]);
        }
      } else {
        // Para comentários normais/usuários
        if (isLiked) {
          // Remover o like
          const { data, error: findError } = await supabase
            .from('likes_comentarios')
            .select('id')
            .eq('comentario_id', commentId)
            .eq('usuario_id', userId)
            .single();
          
          if (findError && findError.code !== 'PGRST116') throw findError;
          
          if (data && data.id) {
            const { error } = await supabase
              .from('likes_comentarios')
              .delete()
              .eq('id', data.id);
              
            if (error) throw error;

            // Atualizar estado local
            setLikedComments(prev => prev.filter(id => id !== commentId));
            
            // Atualização visual
            setComments(prevComments => 
              prevComments.map(c => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    likes: Math.max(0, c.likes - 1)
                  };
                }
                return c;
              })
            );
          }
        } else {
          // Verificar se já existe um like antes de tentar adicionar
          const { data: existingLike, error: checkError } = await supabase
            .from('likes_comentarios')
            .select('id')
            .eq('comentario_id', commentId)
            .eq('usuario_id', userId)
            .maybeSingle();
            
          if (checkError) throw checkError;
          
          // Se não existir, adicionar o like
          if (!existingLike) {
            const { error } = await supabase
              .from('likes_comentarios')
              .insert({
                comentario_id: commentId,
                usuario_id: userId
              })
              .select();
            
            if (error) throw error;
            
            // Registrar atividade de curtida
            await ActivityLogger.logCommentLike(commentId);
            
            // Atualização visual
            setComments(prevComments => 
              prevComments.map(c => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    likes: c.likes + 1
                  };
                }
                return c;
              })
            );
          }

          // Atualizar estado local
          setLikedComments(prev => [...prev, commentId]);
        }
      }
    } catch (error) {
      console.error("Erro ao processar curtida:", error);
      toast.error("Erro ao processar sua curtida. Tente novamente mais tarde.");
    }
  };
  
  const handleOptionClick = (optionId: string) => {
    // Se a opção clicada já está selecionada, remover a seleção
    if (selectedOption === optionId) {
      setSelectedOption(null);
    } else {
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
      exigirLogin({ motivo: "comentar nas questões" });
      return;
    }
    try {
      setSubmittingComment(true);
      
      // Buscar dados do perfil do usuário primeiro - usando formato sem espaços
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id,nome,foto_perfil')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw new Error("Não foi possível obter seus dados de perfil. Tente novamente.");
      }

      // Usar a foto de perfil do usuário se disponível
      const userAvatar = profileData.foto_perfil || "/default-avatar.png";

      // Verificar se o id da questão está definido
      if (!question.id) {
        throw new Error("ID da questão não disponível");
      }

      const { data: newComment, error } = await supabase
        .from('comentarios_questoes')
        .insert({
          questao_id: question.id,
          usuario_id: userId,
          conteudo: comment
        })
        .select()
        .single();

      if (error) {
        console.error("Detalhes do erro ao inserir comentário:", error);
        
        if (error.code === "23502") { // Violação de not null
          throw new Error("Campos obrigatórios não preenchidos");
        } else if (error.code === "23503") { // Violação de foreign key
          throw new Error("Referência inválida à questão ou usuário");
        } else if (error.code === '400' || error.message?.includes('400')) {
          throw new Error(`Erro 400: ${error.message || "Requisição inválida"}`);
        }
        throw error;
      }

      // Registrar a atividade de comentário
      if (newComment) {
        await ActivityLogger.logCommentCreate(
          newComment.id,
          question.id,
          'question'
        );
      }

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
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar comentário. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Corrigir o método que busca contagem total de likes para gabaritos e IA
  useEffect(() => {
    const fetchSpecialLikesCount = async () => {
      try {
        
        // Buscar todos os likes do gabarito para esta questão e contar manualmente
        // Usar ILIKE para pegar tanto IDs parciais quanto completos
        const { data: teacherLikes, error: teacherError } = await supabase
          .from('likes_gabaritos')
          .select('id')
          .ilike('questao_id', `${question.id}%`)
          .eq('type', 'teacher');

        if (teacherError) {
          console.error("❌ Erro ao buscar likes do gabarito:", teacherError);
        } else {
          const count = teacherLikes?.length || 0;
          setTeacherLikesCount(count);
        }

        // Buscar todos os likes da IA para esta questão e contar manualmente
        // Usar ILIKE para pegar tanto IDs parciais quanto completos
        const { data: aiLikes, error: aiError } = await supabase
          .from('likes_gabaritos')
          .select('id')
          .ilike('questao_id', `${question.id}%`)
          .eq('type', 'ai');

        if (aiError) {
          console.error("❌ Erro ao buscar likes da IA:", aiError);
        } else {
          const count = aiLikes?.length || 0;
          setAILikesCount(count);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar contagem de likes especiais:", error);
      }
    };

    fetchSpecialLikesCount();
  }, [question.id, likedComments]); // Atualiza quando os likes mudarem

  useEffect(() => {
    const fetchLastUpdatedBy = async () => {
      if (!question.id) return;

      // Check global flag first - if we know table doesn't exist, skip entirely
      if (atualizacoesQuestoesTableExists === false) {
        return;
      }

      // If a check is already in progress, wait and skip
      if (tableCheckInProgress) {
        return;
      }

      // If we haven't checked yet, check with localStorage cache first
      if (atualizacoesQuestoesTableExists === null) {
        const cached = localStorage.getItem('atualizacoes_questoes_exists');
        if (cached === 'false') {
          atualizacoesQuestoesTableExists = false;
          return;
        } else if (cached === 'true') {
          atualizacoesQuestoesTableExists = true;
        } else {
          // If no cache exists, set in progress immediately to prevent race conditions
          tableCheckInProgress = true;
        }
      }

      // If table is confirmed to exist, proceed with the request
      if (atualizacoesQuestoesTableExists === true) {
        try {
          const { data: updateData, error } = await supabase
            .from('atualizacoes_questoes')
            .select('id,questao_id,professor_id,created_at')
            .eq('questao_id', question.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error) {
            // If we get a 406 here, table was deleted - update cache
            if (error.code === '406' || 
                error.code === 'PGRST101' || 
                error.message?.includes('does not exist') ||
                error.message?.includes('Not Acceptable')) {
              atualizacoesQuestoesTableExists = false;
              localStorage.setItem('atualizacoes_questoes_exists', 'false');
              return;
            }
            // No records found but table exists
            if (error.code === 'PGRST116') {
              return;
            }
            console.error("Erro ao buscar última atualização:", error);
            return;
          }

          // Fetch teacher profile if we have data
          if (updateData && updateData.professor_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id,foto_perfil')
              .eq('id', updateData.professor_id)
              .single();

            if (profileError) {
              console.error("Erro ao buscar perfil do professor:", profileError);
              return;
            }

            if (profileData?.foto_perfil) {
              setGabaritoAvatar(profileData.foto_perfil);
            }
          }
        } catch (error: any) {
          if (error?.code === '406' ||
              error?.message?.includes('does not exist') || 
              error?.message?.includes('Not Acceptable')) {
            atualizacoesQuestoesTableExists = false;
            localStorage.setItem('atualizacoes_questoes_exists', 'false');
            return;
          }
          console.error("Erro geral ao buscar última atualização:", error);
        }
        return;
      }

      // Only make the initial check if we don't know the table status
      if (atualizacoesQuestoesTableExists === null && tableCheckInProgress) {
        try {
          const { data: updateData, error } = await supabase
            .from('atualizacoes_questoes')
            .select('id,questao_id,professor_id,created_at')
            .eq('questao_id', question.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error) {
            // Table doesn't exist - mark globally and in cache
            if (error.code === '406' || 
                error.code === 'PGRST101' || 
                error.message?.includes('does not exist') ||
                error.message?.includes('Not Acceptable')) {
              atualizacoesQuestoesTableExists = false;
              localStorage.setItem('atualizacoes_questoes_exists', 'false');
              return;
            }
            // No records found but table exists
            if (error.code === 'PGRST116') {
              atualizacoesQuestoesTableExists = true;
              localStorage.setItem('atualizacoes_questoes_exists', 'true');
              return;
            }
            console.error("Erro ao buscar última atualização:", error);
            return;
          }

          // Success - table exists
          atualizacoesQuestoesTableExists = true;
          localStorage.setItem('atualizacoes_questoes_exists', 'true');

          // Fetch teacher profile if we have data
          if (updateData && updateData.professor_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id,foto_perfil')
              .eq('id', updateData.professor_id)
              .single();

            if (profileError) {
              console.error("Erro ao buscar perfil do professor:", profileError);
              return;
            }

            if (profileData?.foto_perfil) {
              setGabaritoAvatar(profileData.foto_perfil);
            }
          }
        } catch (error: any) {
          // Catch any other table-related errors
          if (error?.code === '406' ||
              error?.message?.includes('does not exist') || 
              error?.message?.includes('Not Acceptable')) {
            atualizacoesQuestoesTableExists = false;
            localStorage.setItem('atualizacoes_questoes_exists', 'false');
            return;
          }
          console.error("Erro geral ao buscar última atualização:", error);
        } finally {
          tableCheckInProgress = false;
        }
      }
    };

    fetchLastUpdatedBy();
  }, [question.id]);

  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Buscar o perfil com campos específicos
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id,role')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Erro ao verificar permissões admin:", profileError);
          return;
        }
          
        setIsAdmin(profileData?.role === 'admin');
      } catch (error) {
        console.error("Erro ao verificar permissões admin:", error);
      }
    };
    
    checkAdmin();
  }, []);
  
  // Função para corrigir metadados das respostas
  const fixAllResponsesMetadata = async () => {
    if (!isAdmin) return;
    
    try {
      setIsFixingMetadata(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Buscar todas as respostas que têm problemas de metadados
      const { data: respostasProblematicas, error: queryError } = await supabase
        .from('respostas_alunos')
        .select('id, questao_id, disciplina, topicos')
        .or('disciplina.is.null,topicos.is.null,disciplina.eq.');
      
      if (queryError) {
        console.error("Erro ao buscar respostas com problemas:", queryError);
        toast.error("Erro ao buscar respostas");
        return;
      }
      
      if (!respostasProblematicas || respostasProblematicas.length === 0) {
        toast.success("Nenhuma resposta com problemas encontrada");
        return;
      }
      
      toast.info(`Encontradas ${respostasProblematicas.length} respostas com metadados problemáticos. Tentando corrigir...`);
      
      // Interface para resposta
      interface RespostaAluno {
        id: string;
        questao_id: string;
        disciplina?: string;
        topicos?: string[];
      }
      
      // Interface para o mapa de respostas
      interface RespostasPorQuestaoMap {
        [questao_id: string]: RespostaAluno[];
      }
      
      // Agrupar respostas por questão para reduzir o número de consultas
      const respostasPorQuestao: RespostasPorQuestaoMap = {};
      
      respostasProblematicas.forEach((resposta: RespostaAluno) => {
        if (!respostasPorQuestao[resposta.questao_id]) {
          respostasPorQuestao[resposta.questao_id] = [];
        }
        respostasPorQuestao[resposta.questao_id].push(resposta);
      });
      
      // Para cada questão, buscar metadados e atualizar as respostas
      let corrigidas = 0;
      let falhas = 0;
      
      for (const questaoId of Object.keys(respostasPorQuestao)) {
        // Buscar dados da questão
        const { data: questaoData, error: questaoError } = await supabase
          .from('questoes')
          .select('discipline, topicos')
          .eq('id', questaoId)
          .single();
          
        if (questaoError) {
          console.error(`Erro ao buscar dados da questão ${questaoId}:`, questaoError);
          falhas += respostasPorQuestao[questaoId].length;
          continue;
        }
        
        const discipline = questaoData?.discipline || "";
        const topicos = questaoData?.topicos || [];
        
        // Se a questão não tem metadados, ignoramos
        if (!discipline && (!topicos || topicos.length === 0)) {
          falhas += respostasPorQuestao[questaoId].length;
          continue;
        }
        
        // Atualizar cada resposta dessa questão
        for (const resposta of respostasPorQuestao[questaoId]) {
          const { error: updateError } = await supabase
            .from('respostas_alunos')
            .update({
              disciplina: discipline,
              topicos: topicos
            })
            .eq('id', resposta.id);
            
          if (updateError) {
            console.error(`Erro ao atualizar resposta ${resposta.id}:`, updateError);
            falhas++;
          } else {
            corrigidas++;
          }
        }
      }
      
      toast.success(`Processo concluído: ${corrigidas} respostas corrigidas, ${falhas} falhas.`);
    } catch (error) {
      console.error("Erro no processo de correção:", error);
      toast.error("Erro ao corrigir respostas");
    } finally {
      setIsFixingMetadata(false);
    }
  };

  return (
    <div className={moderna ? "w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]" : "w-full bg-white rounded-xl mb-4"}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <QuestionHeader
            year={question.year || ""}
            institution={question.institution || ""}
            organization={question.organization || ""}
            role={question.role || ""}
            educationLevel={question.educationLevel || ""}
            discipline={question.discipline || ""}
            topics={loadedTopics.length > 0 ? loadedTopics : (question.topics || [])}
            assunto={(question as any).assuntos && Array.isArray((question as any).assuntos) && (question as any).assuntos.length > 0 ? (question as any).assuntos[0] : ""}
            questionId={question.id}
            hideInfo={isSimuladoPage && !hasAnswered}
            aparencia={aparencia}
            numero={numero}
            situacaoAnterior={situacaoAnterior}
          />
        </div>
      </div>

      {/* Conteúdo expandível */}
      {hasExpandableContent && (
        <div className={moderna ? "mt-4 mb-1 px-4 md:px-5" : "mt-6 mb-2 px-4"}>
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
            <div className="mt-2 p-4 bg-gray-50 rounded-lg" 
              dangerouslySetInnerHTML={{ __html: prepareHtmlContent(question.expandableContent || '') }} 
            />
          )}
        </div>
      )}

      {/* Conteúdo da questão */}
      <div className={moderna ? "flex w-full items-start px-4 pt-4 pb-2 text-base text-slate-800 md:px-5" : "flex gap-2.5 items-start px-5 py-2.5 w-full text-base text-slate-800"}>
        <div className={moderna ? "relative flex w-full flex-col" : "flex flex-col w-full py-5 rounded-md relative"}>
          <p className="text-left text-sm md:text-base" 
            dangerouslySetInnerHTML={{
              __html: prepareHtmlContent(question.content)
            }} 
          />
        </div>
      </div>

      {/* Comando da questão */}
      {question.command && (
        <div className="mb-4 px-4 text-gray-700" 
          dangerouslySetInnerHTML={{ __html: prepareHtmlContent(question.command) }} 
        />
      )}

      {question.options.map((option, index) => (
        <QuestionOption 
          key={option.id} 
          id={option.id} 
          text={option.text} 
          index={index} 
          isDisabled={disabledOptions.includes(option.id) || (isSimuladoPage && hasAnswered)} 
          isSelected={selectedOption === option.id} 
          isCorrect={Boolean(option.isCorrect)} 
          onToggleDisabled={handleToggleDisabled} 
          onSelect={handleOptionClick} 
          showAnswer={showAnswer} 
          questionType={question.questionType}
        />
      ))}

      {(!isSimuladoPage || !hasAnswered) && (
        <div className="flex justify-start px-4 mt-4 mb-4">
          <Button
            onClick={handleAnswer}
            disabled={!selectedOption || isSubmittingAnswer || (isQuestionsPage && hasAnsweredInCurrentSession)}
            variant="flat"
            className={(!selectedOption || isSubmittingAnswer || (isQuestionsPage && hasAnsweredInCurrentSession)) ? "opacity-50" : ""}
          >
            {isSubmittingAnswer ? "Enviando..." : (isQuestionsPage && hasAnsweredInCurrentSession) ? "Respondido" : "Responder"}
          </Button>
        </div>
      )}

      <QuestionFooter 
        commentsCount={commentsCount}
        showComments={showComments}
        showOfficialAnswer={showOfficialAnswer}
        showAIAnswer={showAIAnswer}
        onToggleComments={toggleComments}
        onToggleOfficialAnswer={toggleOfficialAnswer}
        onToggleAIAnswer={toggleAIAnswer}
        hasTeacherExplanation={Boolean(question.teacherExplanation)}
        hasAIExplanation={Boolean(question.aiExplanation)}
        addToBookDialog={
          shouldShowButtons && <Dialog open={openAddToBook} onOpenChange={(abrir) => {
            if (abrir && !usuarioLogado && !exigirLogin({ motivo: "salvar questões nos seus cadernos" })) return;
            setOpenAddToBook(abrir);
          }}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <BookPlus className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar ao Caderno de Questões</DialogTitle>
                <DialogDescription>
                  Escolha um caderno existente ou crie um novo.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-4">
                {!creatingBook && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Caderno de Questões</label>
                    <div className="flex gap-2">
                      <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um caderno" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map(book => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        onClick={() => setCreatingBook(true)}
                      >
                        Novo
                      </Button>
                    </div>
                    {loadingBooks && <p className="text-sm text-gray-500 mt-2">Carregando cadernos...</p>}
                  </div>
                )}

                {creatingBook && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome do Caderno</label>
                      <Input
                        value={newBookTitle}
                        onChange={e => setNewBookTitle(e.target.value)}
                        placeholder="Ex: Questões de Português"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Visibilidade</label>
                      <Select value={newBookType} onValueChange={(value: 'public' | 'private') => setNewBookType(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a visibilidade" />
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
        onRemove={onRemove ? () => onRemove(question.id) : undefined}
        isAdmin={isAdmin}
        isFixingMetadata={isFixingMetadata}
        onFixMetadata={isAdmin ? fixAllResponsesMetadata : undefined}
        hideButtons={isSimuladoPage && !hasAnswered}
      />

      {showOfficialAnswer && question.teacherExplanation && shouldShowButtons && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: `teacher-${question.id}`,
        author: "Professor",
        avatar: gabaritoAvatar,
        content: prepareHtmlContent(question.teacherExplanation),
        timestamp: "Gabarito oficial",
        likes: teacherLikesCount
      }} isLiked={likedComments.includes(`teacher-${question.id}`)} onToggleLike={toggleLike} />
        </section>}

      {showAIAnswer && question.aiExplanation && shouldShowButtons && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: `ai-${question.id}`,
        author: "BIA (BomEstudo IA)",
        avatar: "/lovable-uploads/BIA.jpg",
        content: prepareHtmlContent(question.aiExplanation),
        timestamp: "Resposta da IA",
        likes: aiLikesCount
      }} isLiked={likedComments.includes(`ai-${question.id}`)} onToggleLike={toggleLike} />
        </section>}

      {/* Seção de comentários */}
      {showComments && shouldShowButtons && (
        <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <div>
            <h3 className="text-lg font-medium mb-4 px-5">Comentários ({commentsCount})</h3>
            
            {/* Formulário de comentário */}
            {userId ? (
              <div className="mb-6 px-5">
                <div className="flex items-start gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/50 resize-none"
                    rows={3}
                    disabled={submittingComment}
                  ></textarea>
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!comment.trim() || submittingComment}
                    variant="flat"
                    className="flex items-center"
                  >
                    {submittingComment ? "Enviando..." : "Comentar"}
                    {!submittingComment && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg mx-5">
                <p className="text-gray-600">Faça login para deixar seu comentário</p>
              </div>
            )}
            
            {/* Lista de comentários */}
            {comments.length > 0 ? (
              <div className="space-y-4 px-5">
                {comments.map(comment => (
                  <QuestionComment 
                    key={comment.id} 
                    comment={comment} 
                    isLiked={likedComments.includes(comment.id)} 
                    onToggleLike={toggleLike} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};