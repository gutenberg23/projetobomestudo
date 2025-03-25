import { useState, useEffect } from "react";
import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface, MOCK_POSTS } from "../types";
import { fetchBlogPosts } from "@/services/blogService";

export function usePostsState() {
  const [modo, setModo] = useState<ModoInterface>(ModoInterface.LISTAR);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [postEditando, setPostEditando] = useState<BlogPost | null>(null);
  
  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autor, setAutor] = useState("");
  const [autorAvatar, setAutorAvatar] = useState("");
  const [categoria, setCategoria] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [tags, setTags] = useState("");
  const [metaDescricao, setMetaDescricao] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState("");
  const [imagemDestaque, setImagemDestaque] = useState("");
  const [regiao, setRegiao] = useState<Region | "none">("none");
  const [estado, setEstado] = useState("none");
  const [postsRelacionados, setPostsRelacionados] = useState("");

  // Buscar posts do banco de dados ao carregar o componente
  useEffect(() => {
    const carregarPosts = async () => {
      setLoading(true);
      try {
        const postsData = await fetchBlogPosts();
        setPosts(postsData.length > 0 ? postsData : MOCK_POSTS);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        setPosts(MOCK_POSTS); // Fallback para dados mock em caso de erro
      } finally {
        setLoading(false);
      }
    };

    carregarPosts();
  }, []);

  // Filtragem dos posts baseado na busca
  const postsFiltrados = posts.filter(post => 
    post.title.toLowerCase().includes(busca.toLowerCase()) || 
    post.author.toLowerCase().includes(busca.toLowerCase()) ||
    post.category.toLowerCase().includes(busca.toLowerCase())
  );

  return {
    modo,
    setModo,
    posts,
    setPosts,
    loading,
    setLoading,
    busca,
    setBusca,
    postEditando,
    setPostEditando,
    postsFiltrados,
    titulo,
    setTitulo,
    resumo,
    setResumo,
    conteudo,
    setConteudo,
    autor,
    setAutor,
    autorAvatar,
    setAutorAvatar,
    categoria,
    setCategoria,
    destacado,
    setDestacado,
    tags,
    setTags,
    metaDescricao,
    setMetaDescricao,
    metaKeywords,
    setMetaKeywords,
    tempoLeitura,
    setTempoLeitura,
    imagemDestaque,
    setImagemDestaque,
    regiao,
    setRegiao,
    estado,
    setEstado,
    postsRelacionados,
    setPostsRelacionados
  };
}
