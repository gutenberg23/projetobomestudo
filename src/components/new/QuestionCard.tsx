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
  const [teacherLikesCount, setTeacherLikesCount] = useState(0);
  const [aiLikesCount, setAILikesCount] = useState(0);
  const [gabaritoAvatar, setGabaritoAvatar] = useState<string>("/default-avatar.png");
  const [hasVerifiedMetadata, setHasVerifiedMetadata] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFixingMetadata, setIsFixingMetadata] = useState(false);
  const [loadedTopics, setLoadedTopics] = useState<string[]>([]);

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
        console.log("Buscando tópicos diretamente do banco para questão:", question.id);
        
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
          console.log("Tópicos encontrados no banco:", data.topicos);
          setLoadedTopics(data.topicos);
        } else {
          console.log("Nenhum tópico encontrado no banco para esta questão");
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
          console.log("Questão com metadados incompletos detectada:", question.id);
          console.log("Dados atuais:", {
            discipline: question.discipline || "Indefinida",
            topics: question.topics || []
          });
          
          // Buscar informações completas da questão do banco de dados
          const { data: questionData, error } = await supabase
            .from('questoes')
            .select('discipline, topicos')
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
            
            if (disciplineBD || (topicsBD && topicsBD.length > 0)) {
              console.log("Dados recuperados do banco:", {
                discipline: disciplineBD,
                topics: topicsBD
              });
              
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
                  console.log(`Encontradas ${respostasDesatualizadas.length} respostas desatualizadas para atualizar`);
                  
                  // Atualizar cada resposta com os metadados corretos
                  for (const resposta of respostasDesatualizadas) {
                    const { error: updateError } = await supabase
                      .from('respostas_alunos')
                      .update({
                        disciplina: disciplineBD || resposta.disciplina || "",
                        topicos: topicsBD?.length > 0 ? topicsBD : (resposta.topicos || [])
                      })
                      .eq('id', resposta.id);
                      
                    if (updateError) {
                      console.error("Erro ao atualizar resposta:", updateError);
                    } else {
                      console.log("Resposta atualizada com sucesso:", resposta.id);
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

    // Log para depuração - verificar se a questão tem tópicos
    console.log("Question object:", {
      id: question.id,
      discipline: question.discipline,
      topics: question.topics,
      hasTopics: Boolean(question.topics && question.topics.length > 0)
    });

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
        console.log("🔍 USER_ID carregado:", user.id);
        
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
        
        console.log("🔍 LIKES de comentários carregados:", likesData);
        
        // Verificar quais gabaritos/IA já foram curtidos pelo usuário
        // Usamos o ID completo da questão
        const {
          data: likesGabaritosData
        } = await supabase
          .from('likes_gabaritos')
          .select('questao_id, type')
          .eq('usuario_id', user.id)
          .ilike('questao_id', `${question.id}%`); // Usar ILIKE para pegar tanto IDs parciais quanto completos
        
        console.log("🔍 LIKES de gabaritos carregados:", likesGabaritosData);
        
        // Combinar os dois tipos de likes
        const likedCommentIds = likesData?.map(like => like.comentario_id) || [];
        
        // Processar os likes de gabaritos e IA corretamente
        const likedSpecialComments = likesGabaritosData?.map(like => {
          // Se tiver um tipo definido (teacher ou ai), use-o, caso contrário assuma teacher (para compatibilidade)
          const type = like.type || 'teacher';
          // Usar o ID completo da questão
          const fullId = `${type}-${question.id}`;
          console.log("🔍 Construindo ID para comentário especial:", fullId);
          return fullId;
        }) || [];
        
        const allLikes = [...likedCommentIds, ...likedSpecialComments];
        console.log("🔍 TODOS os likes combinados:", allLikes);
        
        setLikedComments(allLikes);
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
        const { data: commentsData, error } = await supabase
          .from('comentarios_questoes')
          .select('*')
          .eq('questao_id', question.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erro ao buscar comentários:", error);
          return;
        }

        if (commentsData && commentsData.length > 0) {
          // Para cada comentário, buscar os dados do perfil e likes separadamente
          const formattedComments = await Promise.all(commentsData.map(async (comment: any) => {
            // Buscar perfil do usuário
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('nome, foto_perfil')
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
    return banca?.trim().toUpperCase() || '';
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
          // Garantir que tenhamos a disciplina, usando fallbacks caso necessário
          const disciplina = question.discipline || "";
          // Usar loadedTopics se disponível, senão usar topics da question
          const topicos = loadedTopics.length > 0 ? loadedTopics : (question.topics || []);
          const banca = normalizarBanca(question.institution || "");
          
          // Verificar se temos os dados necessários
          if (!disciplina) {
            console.error("Disciplina não encontrada para a questão:", question.id);
            toast.error("Não foi possível enviar sua resposta: dados de disciplina ausentes.");
            return;
          }
          
          if (!topicos || topicos.length === 0) {
            console.warn("Tópicos não encontrados para a questão:", question.id);
            // Permitimos continuar, mas logamos o aviso
          }
          
          console.log("Enviando resposta com os seguintes dados:", {
            aluno_id: userId,
            questao_id: question.id,
            opcao_id: selectedOption,
            is_correta: isCorrect,
            topicos,
            disciplina,
            banca
          });

          const { error } = await supabase
            .from('respostas_alunos')
            .insert({
              aluno_id: userId,
              questao_id: question.id,
              opcao_id: selectedOption,
              is_correta: isCorrect,
              topicos: topicos,
              disciplina: disciplina,
              banca: banca
            });
            
          if (error) {
            console.error("Erro detalhado ao registrar resposta:", error);
            throw error;
          }
          
          setHasAnswered(true);
          setShowAnswer(true);
          toast.success("Resposta registrada com sucesso!");
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
      console.log("💗 CURTIDA INICIADA em:", commentId);
      console.log("💗 Estado atual de likedComments:", likedComments);
      
      // Verificar se é um comentário de professor/gabarito ou IA
      const isProfessorOrAI = commentId.startsWith('teacher-') || commentId.startsWith('ai-');
      
      // Verificar se já está nos likes (interface)
      const isLiked = likedComments.includes(commentId);
      console.log("💗 Já está curtido?", isLiked);
      
      if (isProfessorOrAI) {
        // Extrair o ID real da questão do formato "teacher-XXXX" ou "ai-XXXX"
        // Aqui está o problema: temos que pegar todo o ID após o prefixo e o hífen
        const type = commentId.startsWith('teacher-') ? 'teacher' : 'ai';
        const questaoId = commentId.substring(type.length + 1); // +1 para o hífen
        
        console.log("💗 Tipo de comentário especial:", type, "questaoId COMPLETO:", questaoId);
        
        if (isLiked) {
          console.log("💗 Removendo like de comentário especial");
          // Remover o like - buscar o ID do like para deletar corretamente
          const { data, error: findError } = await supabase
            .from('likes_gabaritos')
            .select('id')
            .eq('questao_id', questaoId)
            .eq('usuario_id', userId)
            // Incluir type na busca para diferenciar entre teacher e ai
            .eq('type', type)
            .single();
          
          console.log("💗 Resultado da busca para remover like:", data, findError);
          
          if (findError && findError.code !== 'PGRST116') throw findError;
          
          if (data && data.id) {
            const { error } = await supabase
              .from('likes_gabaritos')
              .delete()
              .eq('id', data.id);
              
            console.log("💗 Resultado da remoção do like:", error ? "Erro: " + error.message : "Sucesso");
            
            if (error) throw error;

            // Atualizar estado local
            setLikedComments(prev => {
              const newState = prev.filter(id => id !== commentId);
              console.log("💗 Novo estado de likedComments após remoção:", newState);
              return newState;
            });
            
            // Atualizar contadores específicos
            if (type === 'teacher') {
              setTeacherLikesCount(prev => {
                const newCount = Math.max(0, prev - 1);
                console.log("💗 Contador de likes do professor atualizado:", newCount);
                return newCount;
              });
            } else if (type === 'ai') {
              setAILikesCount(prev => {
                const newCount = Math.max(0, prev - 1);
                console.log("💗 Contador de likes da IA atualizado:", newCount);
                return newCount;
              });
            }
          }
        } else {
          console.log("💗 Adicionando like em comentário especial");
          // Verificar se já existe um like antes de tentar adicionar
          const { data: existingLike, error: checkError } = await supabase
            .from('likes_gabaritos')
            .select('id')
            .eq('questao_id', questaoId)
            .eq('usuario_id', userId)
            // Incluir type na busca para diferenciar entre teacher e ai
            .eq('type', type)
            .maybeSingle();
            
          console.log("💗 Verificação de like existente:", existingLike, checkError);
            
          if (checkError) throw checkError;
          
          // Se não existir, adicionar o like
          if (!existingLike) {
            console.log("💗 Like não existe, inserindo novo...");
            const { data, error } = await supabase
              .from('likes_gabaritos')
              .insert({
                questao_id: questaoId,
                usuario_id: userId,
                type: type // Incluir o tipo para diferenciar entre teacher e ai
              })
              .select();
              
            console.log("💗 Resultado da inserção do like:", data, error ? "Erro: " + error.message : "Sucesso");
              
            if (error) throw error;
            
            // Atualizar contadores específicos
            if (type === 'teacher') {
              setTeacherLikesCount(prev => {
                const newCount = prev + 1;
                console.log("💗 Contador de likes do professor atualizado:", newCount);
                return newCount;
              });
            } else if (type === 'ai') {
              setAILikesCount(prev => {
                const newCount = prev + 1;
                console.log("💗 Contador de likes da IA atualizado:", newCount);
                return newCount;
              });
            }
          } else {
            console.log("💗 Like já existe no banco, não inserindo.");
          }

          // Atualizar estado local
          setLikedComments(prev => {
            const newState = [...prev, commentId];
            console.log("💗 Novo estado de likedComments após adição:", newState);
            return newState;
          });
        }
      } else {
        console.log("💗 Processando like de comentário normal de usuário");
        // Para comentários normais/usuários
        if (isLiked) {
          console.log("💗 Removendo like de comentário normal");
          // Remover o like - buscar o ID do like para deletar corretamente
          const { data, error: findError } = await supabase
            .from('likes_comentarios')
            .select('id')
            .eq('comentario_id', commentId)
            .eq('usuario_id', userId)
            .single();
          
          console.log("💗 Resultado da busca para remover like:", data, findError);
          
          if (findError && findError.code !== 'PGRST116') throw findError;
          
          if (data && data.id) {
            const { error } = await supabase
              .from('likes_comentarios')
              .delete()
              .eq('id', data.id);
              
            console.log("💗 Resultado da remoção do like:", error ? "Erro: " + error.message : "Sucesso");
              
            if (error) throw error;

            // Atualizar estado local somente se a operação no banco foi bem-sucedida
            setLikedComments(prev => {
              const newState = prev.filter(id => id !== commentId);
              console.log("💗 Novo estado de likedComments após remoção:", newState);
              return newState;
            });
            
            // Atualização visual somente se a operação no banco foi bem-sucedida
            setComments(prevComments => {
              console.log("💗 Atualizando contador visual de likes");
              return prevComments.map(c => {
                if (c.id === commentId) {
                  const newLikes = Math.max(0, c.likes - 1);
                  console.log("💗 Novo contador de likes para este comentário:", newLikes);
                  return {
                    ...c,
                    likes: newLikes
                  };
                }
                return c;
              });
            });
          }
        } else {
          console.log("💗 Adicionando like em comentário normal");
          // Verificar se já existe um like antes de tentar adicionar
          const { data: existingLike, error: checkError } = await supabase
            .from('likes_comentarios')
            .select('id')
            .eq('comentario_id', commentId)
            .eq('usuario_id', userId)
            .maybeSingle();
            
          console.log("💗 Verificação de like existente:", existingLike, checkError);
            
          if (checkError) throw checkError;
          
          // Se não existir, adicionar o like
          if (!existingLike) {
            console.log("💗 Like não existe, inserindo novo...");
            const { data, error } = await supabase
              .from('likes_comentarios')
              .insert({
                comentario_id: commentId,
                usuario_id: userId
              })
              .select();
              
            console.log("💗 Resultado da inserção do like:", data, error ? "Erro: " + error.message : "Sucesso");
              
            if (error) throw error;
            
            // Atualizar estado local somente se a operação no banco foi bem-sucedida
            setLikedComments(prev => {
              const newState = [...prev, commentId];
              console.log("💗 Novo estado de likedComments após adição:", newState);
              return newState;
            });
            
            // Atualização visual somente se a operação no banco foi bem-sucedida
            setComments(prevComments => {
              console.log("💗 Atualizando contador visual de likes");
              return prevComments.map(c => {
                if (c.id === commentId) {
                  const newLikes = c.likes + 1;
                  console.log("💗 Novo contador de likes para este comentário:", newLikes);
                  return {
                    ...c,
                    likes: newLikes
                  };
                }
                return c;
              });
            });
          } else {
            console.log("💗 Like já existe no banco, não inserindo.");
            // O like já existe no banco, mas não no estado local.
            // Vamos apenas atualizar o estado local para corrigir a UI
            if (!likedComments.includes(commentId)) {
              console.log("💗 Atualizando apenas estado local para like existente");
              setLikedComments(prev => {
                const newState = [...prev, commentId];
                console.log("💗 Novo estado de likedComments:", newState);
                return newState;
              });
            }
          }
        }
      }
      console.log("💗 Operação de like concluída com sucesso");
    } catch (error) {
      console.error("❌ Erro ao curtir comentário:", error);
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
      
      // Buscar dados do perfil do usuário primeiro - corrigindo os campos selecionados
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nome, foto_perfil')
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
        console.log("🔢 Buscando contagem de likes para ID da questão:", question.id);
        
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
          console.log("✅ Contagem de likes do gabarito:", count, "- Dados:", teacherLikes);
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
          console.log("✅ Contagem de likes da IA:", count, "- Dados:", aiLikes);
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

      try {
        // Buscar a última atualização
        const { data: updateData, error } = await supabase
          .from('atualizacoes_questoes')
          .select('*')
          .eq('questao_id', question.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Nenhuma atualização encontrada, usar avatar padrão
            console.log("Nenhuma atualização de professor encontrada para esta questão");
            return;
          }
          console.error("Erro ao buscar última atualização:", error);
          return;
        }

        // Buscar o perfil do professor separadamente
        if (updateData && updateData.professor_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('foto_perfil')
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
      } catch (error) {
        console.error("Erro ao buscar última atualização:", error);
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
        
        // Buscar o perfil do usuário para verificar se é admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        setIsAdmin(profileData?.is_admin || false);
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
          console.warn(`Questão ${questaoId} não tem metadados para atualizar`);
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
            console.log(`Resposta ${resposta.id} atualizada com sucesso`);
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
            topics={loadedTopics.length > 0 ? loadedTopics : (question.topics || [])}
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
        showStats={showStats}
        showOfficialAnswer={showOfficialAnswer} 
        showAIAnswer={showAIAnswer} 
        onToggleComments={toggleComments} 
        onToggleAnswer={toggleStats}
        onToggleOfficialAnswer={toggleOfficialAnswer} 
        onToggleAIAnswer={toggleAIAnswer} 
        hasTeacherExplanation={Boolean(question.teacherExplanation)} 
        hasAIExplanation={Boolean(question.aiExplanation)} 
        onRemove={onRemove ? () => onRemove(question.id) : undefined}
        isAdmin={isAdmin}
        isFixingMetadata={isFixingMetadata}
        onFixMetadata={fixAllResponsesMetadata}
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
        avatar: gabaritoAvatar,
        content: question.teacherExplanation,
        timestamp: "Gabarito oficial",
        likes: teacherLikesCount
      }} isLiked={likedComments.includes(`teacher-${question.id}`)} onToggleLike={toggleLike} />
        </section>}

      {showAIAnswer && question.aiExplanation && <section className="py-3 md:py-5 w-full border-t border-gray-100">
          <QuestionComment comment={{
        id: `ai-${question.id}`,
        author: "BIA (BomEstudo IA)",
        avatar: "/lovable-uploads/BIA.jpg",
        content: question.aiExplanation,
        timestamp: "Resposta da IA",
        likes: aiLikesCount
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