import { useState, useEffect } from "react";
import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface, MOCK_POSTS } from "../types";
import { fetchBlogPostsWithPagination } from "@/services/blogService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

export function usePostsState() {
  const { user } = useAuth();
  const { isJornalista } = usePermissions();
  const [modo, setModo] = useState<ModoInterface>(ModoInterface.LISTAR);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [postEditando, setPostEditando] = useState<BlogPost | null>(null);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 20;
  
  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autorAvatar, setAutorAvatar] = useState("");
  const [categoria, setCategoria] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [tags, setTags] = useState("");
  const [metaDescricao, setMetaDescricao] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState("");
  const [imagemDestaque, setImagemDestaque] = useState("");
  const [regiao, setRegiao] = useState<Region | "none">("none");
  const [estado, setEstado] = useState("none");
  const [postsRelacionados, setPostsRelacionados] = useState("");

  // Buscar posts do banco de dados ao carregar o componente e quando a página muda
  useEffect(() => {
    const carregarPosts = async () => {
      setLoading(true);
      try {
        // Usar a nova função com paginação
        const { posts: postsData, totalCount } = await fetchBlogPostsWithPagination(
          currentPage, 
          postsPerPage, 
          undefined, 
          true
        );
        
        setPosts(postsData.length > 0 ? postsData : MOCK_POSTS);
        setTotalPosts(totalCount);
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        setPosts(MOCK_POSTS); // Fallback para dados mock em caso de erro
        setTotalPosts(MOCK_POSTS.length);
      } finally {
        setLoading(false);
      }
    };

    carregarPosts();
  }, [currentPage]);

  // Filtragem dos posts baseado na busca
  const postsFiltrados = posts.filter(post => {
    // Filtrar por busca
    const matchesBusca = 
      post.title.toLowerCase().includes(busca.toLowerCase()) || 
      post.author.toLowerCase().includes(busca.toLowerCase()) ||
      post.category.toLowerCase().includes(busca.toLowerCase());
    
    // Se for jornalista, mostrar apenas seus próprios posts
    if (isJornalista() && user?.nome) {
      return matchesBusca && post.author === user.nome;
    }
    
    // Para outros usuários, mostrar todos os posts que correspondem à busca
    return matchesBusca;
  });

  // Calcular o número total de páginas
  const totalPages = Math.ceil(totalPosts / postsPerPage);

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
    autorAvatar,
    setAutorAvatar,
    categoria,
    setCategoria,
    destacado,
    setDestacado,
    isDraft,
    setIsDraft,
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
    setPostsRelacionados,
    // Estados de paginação
    currentPage,
    setCurrentPage,
    totalPages,
    totalPosts
  };
}