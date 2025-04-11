import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface } from "../types";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

type PostsState = ReturnType<typeof import("./usePostsState").usePostsState>;

export function usePostsActions(state: PostsState) {
  const {
    posts,
    setPosts,
    setModo,
    setTitulo,
    setResumo,
    setConteudo,
    setAutor,
    setAutorAvatar,
    setCategoria,
    setDestacado,
    setTags,
    setMetaDescricao,
    setMetaKeywords,
    setTempoLeitura,
    setImagemDestaque,
    setRegiao,
    setEstado,
    setPostsRelacionados,
    setPostEditando,
    titulo,
    resumo,
    conteudo,
    autor,
    categoria,
    destacado,
    tags,
    metaDescricao,
    metaKeywords,
    tempoLeitura,
    imagemDestaque,
    regiao,
    estado,
    postsRelacionados,
    postEditando,
    setLoading
  } = state;

  const { user } = useAuth();
  const { isJornalista } = usePermissions();

  // Iniciar criação de um novo post
  const iniciarCriacaoPost = () => {
    console.log("iniciarCriacaoPost chamada - verificando valores atuais:");
    console.log("Título atual:", titulo);
    console.log("Resumo atual:", resumo);
    console.log("Conteúdo atual:", conteudo);
    
    // Não limpar os campos se já estiverem preenchidos
    if (!titulo && !resumo && !conteudo) {
      console.log("Campos vazios, inicializando com valores padrão");
      setTitulo("");
      setResumo("");
      setConteudo("");
      
      // Se for jornalista, preencher automaticamente o autor com o nome do usuário
      if (isJornalista() && user?.nome) {
        setAutor(user.nome);
      } else {
        setAutor("");
      }
      
      setAutorAvatar("");
      setCategoria("");
      setDestacado(false);
      setTags("");
      setMetaDescricao("");
      setMetaKeywords("");
      setTempoLeitura("");
      setImagemDestaque("");
      setRegiao("none");
      setEstado("none");
      setPostsRelacionados("");
    } else {
      console.log("Mantendo valores existentes dos campos que já foram preenchidos");
    }
    
    // Definir o postEditando como null e mudar para o modo de criação
    setPostEditando(null);
    console.log("Alterando modo para CRIAR");
    setModo(ModoInterface.CRIAR);
    console.log("Modo alterado para:", ModoInterface.CRIAR);
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
    setAutor(post.author);
    setAutorAvatar(post.authorAvatar || "");
    setCategoria(post.category);
    setDestacado(post.featured || false);
    setTags(post.tags ? post.tags.join(", ") : "");
    setMetaDescricao(post.metaDescription || "");
    setMetaKeywords(post.metaKeywords ? post.metaKeywords.join(", ") : "");
    setTempoLeitura(post.readingTime ? post.readingTime.toString() : "");
    setImagemDestaque(post.featuredImage || "");
    setRegiao(post.region || "none");
    setEstado(post.state || "none");
    setPostsRelacionados(post.relatedPosts ? post.relatedPosts.join(", ") : "");
    setPostEditando(post);
    setModo(ModoInterface.EDITAR);
  };

  // Salvar um post (novo ou editado)
  const salvarPost = async () => {
    // Se for jornalista, garantir que o autor é o próprio usuário
    if (isJornalista() && user?.nome && autor !== user.nome) {
      toast({
        title: "Acesso negado",
        description: "Você só pode criar posts com seu nome como autor.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Geração de slug com timestamp para garantir unicidade
      const timestamp = Date.now().toString(36);
      const slug = titulo
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
        + '-' + timestamp;
      
      // Convert the comma-separated tags into an array
      const tagsArray = tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Parse reading time and convert to string to match BlogPost type
      const readingTimeNumber = tempoLeitura ? parseInt(tempoLeitura, 10) : 
        Math.ceil(conteudo.split(' ').length / 200);
      const readingTimeString = readingTimeNumber.toString();
      
      // Convert related posts to array
      const relatedPostsArray = postsRelacionados.split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      // Convert meta keywords to array
      const metaKeywordsArray = metaKeywords.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      // Definir o autor apropriado
      let postAutor = autor;
      // Se o usuário for jornalista, garantir que o autor é o próprio usuário
      if (isJornalista() && user?.nome) {
        postAutor = user.nome;
      }
      
      const postData = {
        title: titulo,
        summary: resumo,
        content: conteudo,
        author: postAutor,
        authorAvatar: user?.foto_url || '',
        slug: slug,
        category: categoria,
        region: regiao === "none" ? undefined : regiao as Region,
        state: estado === "none" ? undefined : estado,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        metaDescription: metaDescricao || resumo,
        metaKeywords: metaKeywordsArray.length > 0 ? metaKeywordsArray : undefined,
        featuredImage: imagemDestaque || undefined,
        readingTime: readingTimeString,
        relatedPosts: relatedPostsArray.length > 0 ? relatedPostsArray : undefined,
        featured: destacado,
        commentCount: postEditando?.commentCount || 0,
        likesCount: postEditando?.likesCount || 0
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
          return;
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
        // Volta para a listagem
        setModo(ModoInterface.LISTAR);
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

  return {
    iniciarCriacaoPost,
    iniciarEdicaoPost,
    salvarPost,
    excluirPost
  };
}
