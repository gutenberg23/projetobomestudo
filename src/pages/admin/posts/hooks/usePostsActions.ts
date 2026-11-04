import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface } from "../types";
import { createBlogPost, updateBlogPost, deleteBlogPost, updateBlogPostStatus } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { removeAccents } from "@/utils/text-utils";
import { useImageUpload } from "./useImageUpload";

type PostsState = ReturnType<typeof import("./usePostsState").usePostsState>;

export function usePostsActions(state: PostsState) {
  const {
    posts,
    setPosts,
    setModo,
    setTitulo,
    setResumo,
    setConteudo,
    setCategoria,
    setDestacado,
    setIsDraft,
    setTags,
    setMetaDescricao,
    setMetaKeywords,
    setImagemDestaque,
    setRegiao,
    setEstado,
    setPostsRelacionados,
    setPostEditando,
    titulo,
    resumo,
    conteudo,
    categoria,
    destacado,
    isDraft,
    tags,
    metaDescricao,
    metaKeywords,
    imagemDestaque,
    regiao,
    estado,
    postsRelacionados,
    postEditando,
    setLoading,
    recarregar
  } = state;

  const { user } = useAuth();
  const { isJornalista } = usePermissions();
  const { downloadAndUploadImage } = useImageUpload();

  // Iniciar criação de um novo post
  const iniciarCriacaoPost = () => {
    setTitulo("");
    setResumo("");
    setConteudo("");
    setCategoria("Concursos");
    setDestacado(false);
    setIsDraft(false);
    setTags("");
    setMetaDescricao("");
    setMetaKeywords("");
    setImagemDestaque("");
    setRegiao("none");
    setEstado("none");
    setPostsRelacionados("");
    setPostEditando(null);
    setModo(ModoInterface.CRIAR);
  };

  // Iniciar edição de um post existente
  const iniciarEdicaoPost = (post: BlogPost) => {
    // Se for jornalista, verificar se o post pertence a ele
    if (isJornalista() && user?.nome && post.author !== user.nome) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar posts de sua autoria.",
        variant: "destructive"
      });
      return;
    }
    
    setTitulo(post.title);
    setResumo(post.summary);
    setConteudo(post.content);
    setCategoria(post.category);
    setDestacado(post.featured || false);
    setIsDraft(post.isDraft || false);
    setTags(post.tags ? post.tags.join(", ") : "");
    setMetaDescricao(post.metaDescription || "");
    setMetaKeywords(post.metaKeywords ? post.metaKeywords.join(", ") : "");
    setImagemDestaque(post.featuredImage || "");
    setRegiao(post.region || "none");
    setEstado(post.state || "none");
    setPostsRelacionados(post.relatedPosts ? post.relatedPosts.join(", ") : "");
    setPostEditando(post);
    setModo(ModoInterface.EDITAR);
  };

  // Salvar um post (novo ou editado)
  const salvarPost = async (opcoes: { isDraft?: boolean; continuarEditando?: boolean } = {}): Promise<boolean> => {
    const rascunho = opcoes.isDraft ?? isDraft;
    let sucesso = false;
    setLoading(true);
    try {
      // Processar a imagem destaque se for uma URL externa
      let processedImageUrl = imagemDestaque;
      if (imagemDestaque && (imagemDestaque.startsWith('http://') || imagemDestaque.startsWith('https://'))) {
        // Verificar se já é uma URL do Supabase
        if (!imagemDestaque.includes('supabase') || !imagemDestaque.includes('storage')) {
          console.log('Processando imagem destaque:', imagemDestaque);
          const uploadedUrl = await downloadAndUploadImage(imagemDestaque);
          if (uploadedUrl && uploadedUrl !== imagemDestaque) {
            processedImageUrl = uploadedUrl;
            console.log('Imagem processada com sucesso:', uploadedUrl);
          } else if (uploadedUrl === imagemDestaque) {
            console.warn('Falha ao processar imagem devido a CORS, mantendo URL original');
          } else {
            console.warn('Falha ao processar imagem, usando URL original');
          }
        }
      }
      
      // Geração de slug - apenas para novos posts para manter URLs imutáveis
      let slug;
      if (postEditando) {
        // Para posts existentes, manter o slug original
        slug = postEditando.slug;
      } else {
        // Para novos posts, gerar slug único
        const timestamp = Date.now().toString(36);
        // Remover acentos e caracteres especiais antes de gerar o slug
        const tituloSemAcentos = removeAccents(titulo);
        slug = tituloSemAcentos
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-')
          + '-' + timestamp;
      }
      
      // Convert the comma-separated tags into an array
      const tagsArray = tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Calcular o tempo de leitura automaticamente
      const palavras = conteudo.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      const readingTimeNumber = Math.max(1, Math.ceil(palavras / 200));
      const readingTimeString = readingTimeNumber.toString();
      
      // Convert related posts to array
      const relatedPostsArray = postsRelacionados.split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      // Convert meta keywords to array
      const metaKeywordsArray = metaKeywords.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      const postData = {
        title: titulo,
        summary: resumo,
        content: conteudo,
        author: user?.nome || 'Admin',
        slug: slug,
        category: categoria,
        region: regiao === "none" ? undefined : regiao as Region,
        state: estado === "none" ? undefined : estado,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        metaDescription: metaDescricao || resumo,
        metaKeywords: metaKeywordsArray.length > 0 ? metaKeywordsArray : undefined,
        // String vazia permite remover a imagem de um post já salvo
        featuredImage: processedImageUrl || (postEditando ? "" : undefined),
        readingTime: readingTimeString,
        relatedPosts: relatedPostsArray.length > 0 ? relatedPostsArray : undefined,
        featured: destacado,
        isDraft: rascunho,
        commentCount: postEditando?.commentCount || 0,
        likesCount: postEditando?.likesCount || 0,
        viewCount: postEditando?.viewCount || 0
      };

      let novoPost: BlogPost | null;
      
      if (postEditando) {
        // Se for jornalista, verificar se o post pertence a ele
        if (isJornalista() && user?.nome && postEditando.author !== user.nome) {
          toast({
            title: "Acesso negado",
            description: "Você só pode editar posts de sua autoria.",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
        
        // Atualiza o post existente no banco de dados
        novoPost = await updateBlogPost(postEditando.id, postData);
        if (novoPost) {
          // Atualiza o post na lista local
          setPosts(posts.map(post => post.id === postEditando.id ? novoPost! : post));
          toast({
            title: "Post atualizado",
            description: "O post foi atualizado com sucesso.",
            variant: "default"
          });
        }
      } else {
        // Adiciona um novo post no banco de dados
        novoPost = await createBlogPost(postData);
        if (novoPost) {
          // Adiciona o post na lista local
          setPosts([novoPost, ...posts]);
          toast({
            title: "Post criado",
            description: "O post foi criado com sucesso.",
            variant: "default"
          });
        }
      }

      if (!novoPost) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar o post. Tente novamente.",
          variant: "destructive"
        });
      } else {
        sucesso = true;
        recarregar();
        setIsDraft(rascunho);
        if (opcoes.continuarEditando) {
          // Continua no editor; um post novo passa a ser edição do post salvo
          setPostEditando(novoPost);
          setModo(ModoInterface.EDITAR);
        } else {
          setModo(ModoInterface.LISTAR);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o post. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    return sucesso;
  };

  // Excluir um post
  const excluirPost = async (id: string) => {
    // Se for jornalista, verificar se o post pertence a ele
    if (isJornalista() && user?.nome) {
      const postToDelete = posts.find(post => post.id === id);
      if (postToDelete && postToDelete.author !== user.nome) {
        toast({
          title: "Acesso negado",
          description: "Você só pode excluir posts de sua autoria.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      setLoading(true);
      try {
        const success = await deleteBlogPost(id);
        if (success) {
          setPosts(posts.filter(post => post.id !== id));
          recarregar();
          toast({
            title: "Post excluído",
            description: "O post foi excluído com sucesso.",
            variant: "default"
          });
        } else {
          // Buscar informações detalhadas sobre o erro
          const postInfo = posts.find(post => post.id === id);
          let errorMessage = "Ocorreu um erro ao excluir o post.";
          
          if (isJornalista() && user?.nome && postInfo && postInfo.author !== user.nome) {
            errorMessage = "Você só pode excluir posts de sua autoria.";
          } else if (user?.role !== 'admin' && user?.nivel !== 'admin' && postInfo && postInfo.author !== user?.nome) {
            errorMessage = "Apenas administradores ou o autor do post podem excluí-lo.";
          }
          
          toast({
            title: "Erro",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao excluir post:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o post. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Alternar status do post (rascunho/publicado)
  const togglePostStatus = async (id: string, isDraft: boolean) => {
    setLoading(true);
    try {
      const updatedPost = await updateBlogPostStatus(id, isDraft);
      if (updatedPost) {
        // Atualiza o post na lista local
        setPosts(posts.map(post => post.id === id ? { ...post, isDraft } : post));
        recarregar();
        toast({
          title: "Status atualizado",
          description: `O post foi ${isDraft ? 'marcado como rascunho' : 'publicado'} com sucesso.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao atualizar o status do post. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status do post:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do post. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Ligar/desligar o destaque direto da listagem
  const toggleDestaque = async (post: BlogPost) => {
    if (isJornalista() && user?.nome && post.author !== user.nome) {
      toast({ title: "Acesso negado", description: "Você só pode alterar posts de sua autoria.", variant: "destructive" });
      return;
    }
    const atualizado = await updateBlogPost(post.id, { featured: !post.featured });
    if (atualizado) {
      setPosts(posts.map(p => p.id === post.id ? { ...p, featured: !post.featured } : p));
      recarregar();
      toast({ title: post.featured ? "Destaque removido" : "Post destacado" });
    } else {
      toast({ title: "Erro", description: "Não foi possível alterar o destaque.", variant: "destructive" });
    }
  };

  return {
    toggleDestaque,
    iniciarCriacaoPost,
    iniciarEdicaoPost,
    salvarPost,
    excluirPost,
    togglePostStatus
  };
}