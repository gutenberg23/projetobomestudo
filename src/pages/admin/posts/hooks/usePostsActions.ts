
import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface } from "../types";

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
    postEditando
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
  const salvarPost = () => {
    const slug = titulo
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Convert the comma-separated tags into an array
    const tagsArray = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Parse reading time as number
    const readingTimeNumber = tempoLeitura ? parseInt(tempoLeitura, 10) : 
      Math.ceil(conteudo.split(' ').length / 200);
    
    // Convert related posts to array
    const relatedPostsArray = postsRelacionados.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    // Convert meta keywords to array
    const metaKeywordsArray = metaKeywords.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    const novoPost: BlogPost = {
      id: postEditando ? postEditando.id : `${Date.now()}`,
      title: titulo,
      summary: resumo,
      content: conteudo,
      author: autor,
      authorAvatar: autorAvatar || undefined,
      commentCount: postEditando ? postEditando.commentCount : 0,
      likesCount: postEditando ? postEditando.likesCount : 0,
      createdAt: postEditando ? postEditando.createdAt : new Date().toISOString(),
      slug: slug,
      category: categoria,
      region: regiao as Region || undefined,
      state: estado || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      metaDescription: metaDescricao || resumo,
      metaKeywords: metaKeywordsArray.length > 0 ? metaKeywordsArray : undefined,
      featuredImage: imagemDestaque || undefined,
      readingTime: readingTimeNumber,
      relatedPosts: relatedPostsArray.length > 0 ? relatedPostsArray : undefined,
      featured: destacado
    };

    if (postEditando) {
      // Atualiza o post existente
      setPosts(posts.map(post => post.id === postEditando.id ? novoPost : post));
    } else {
      // Adiciona um novo post
      setPosts([novoPost, ...posts]);
    }

    // Volta para a listagem
    setModo(ModoInterface.LISTAR);
  };

  // Excluir um post
  const excluirPost = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  return {
    iniciarCriacaoPost,
    iniciarEdicaoPost,
    salvarPost,
    excluirPost
  };
}
