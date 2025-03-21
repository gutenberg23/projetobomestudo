
import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface } from "../types";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";

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
    autorAvatar,
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

  // Iniciar criação de um novo post
  const iniciarCriacaoPost = () => {
    setTitulo("");
    setResumo("");
    setConteudo("");
    setAutor("");
    setAutorAvatar("");
    setCategoria("");
    setDestacado(false);
    setTags("");
    setMetaDescricao("");
    setMetaKeywords("");
    setTempoLeitura("");
    setImagemDestaque("");
    setRegiao("");
    setEstado("");
    setPostsRelacionados("");
    setPostEditando(null);
    setModo(ModoInterface.CRIAR);
  };

  // Iniciar edição de um post existente
  const iniciarEdicaoPost = (post: BlogPost) => {
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
    setRegiao(post.region || "");
    setEstado(post.state || "");
    setPostsRelacionados(post.relatedPosts ? post.relatedPosts.join(", ") : "");
    setPostEditando(post);
    setModo(ModoInterface.EDITAR);
  };

  // Salvar um post (novo ou editado)
  const salvarPost = async () => {
    setLoading(true);
    try {
      const slug = titulo
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
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
      
      const postData = {
        title: titulo,
        summary: resumo,
        content: conteudo,
        author: autor,
        authorAvatar: autorAvatar || undefined,
        slug: slug,
        category: categoria,
        region: regiao as Region || undefined,
        state: estado || undefined,
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
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao excluir o post. Tente novamente.",
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
