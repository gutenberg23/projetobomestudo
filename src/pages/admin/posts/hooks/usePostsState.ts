import { useState, useEffect } from "react";
import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface, MOCK_POSTS } from "../types";
import { fetchBlogPosts } from "@/services/blogService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

export function usePostsState() {
  const { user } = useAuth();
  const { isJornalista } = usePermissions();
  const [modo, setModoInterno] = useState<ModoInterface>(ModoInterface.LISTAR);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [postEditando, setPostEditando] = useState<BlogPost | null>(null);
  
  // Campos do formulário
  const [titulo, setTituloInterno] = useState("");
  const [resumo, setResumoInterno] = useState("");
  const [conteudo, setConteudoInterno] = useState("");
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

  // Inicializar o campo de autor com o nome do usuário logado se for jornalista
  useEffect(() => {
    if (isJornalista() && user?.nome) {
      setAutor(user.nome);
    }
  }, [user, isJornalista]);

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

  // Filtragem dos posts baseado na busca e no autor (para jornalistas)
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

  // Wrappers para logar alterações dos estados críticos
  const setModo = (novoModo: ModoInterface) => {
    console.log("usePostsState: setModo chamado com valor:", novoModo);
    setModoInterno(novoModo);
  };
  
  const setTitulo = (novoTitulo: string) => {
    console.log("usePostsState: setTitulo chamado com valor:", novoTitulo ? (novoTitulo.length > 30 ? novoTitulo.substring(0, 30) + "..." : novoTitulo) : "");
    setTituloInterno(novoTitulo);
  };
  
  const setResumo = (novoResumo: string) => {
    console.log("usePostsState: setResumo chamado com valor:", novoResumo ? (novoResumo.length > 30 ? novoResumo.substring(0, 30) + "..." : novoResumo) : "");
    setResumoInterno(novoResumo);
  };
  
  const setConteudo = (novoConteudo: string) => {
    console.log("usePostsState: setConteudo chamado com conteúdo de tamanho:", novoConteudo ? novoConteudo.length : 0);
    setConteudoInterno(novoConteudo);
  };

  // Função para definir múltiplos campos de uma vez (para uso pela IA)
  const preencherFormulario = (dados: {
    titulo?: string,
    resumo?: string,
    conteudo?: string,
    autor?: string,
    categoria?: string,
    tags?: string,
    metaDescricao?: string,
    metaKeywords?: string,
    tempoLeitura?: string,
    regiao?: Region | "none",
    estado?: string
  }) => {
    console.log("usePostsState: preencherFormulario chamado com dados:", 
      Object.keys(dados).map(key => `${key}: ${typeof dados[key as keyof typeof dados] === 'string' ? 
        (dados[key as keyof typeof dados] as string).substring(0, 30) + '...' : 
        dados[key as keyof typeof dados]}`).join(', ')
    );
    
    if (dados.titulo !== undefined) setTituloInterno(dados.titulo);
    if (dados.resumo !== undefined) setResumoInterno(dados.resumo);
    if (dados.conteudo !== undefined) setConteudoInterno(dados.conteudo);
    if (dados.autor !== undefined) setAutor(dados.autor);
    if (dados.categoria !== undefined) setCategoria(dados.categoria);
    if (dados.tags !== undefined) setTags(dados.tags);
    if (dados.metaDescricao !== undefined) setMetaDescricao(dados.metaDescricao);
    if (dados.metaKeywords !== undefined) setMetaKeywords(dados.metaKeywords);
    if (dados.tempoLeitura !== undefined) setTempoLeitura(dados.tempoLeitura);
    if (dados.regiao !== undefined) setRegiao(dados.regiao);
    if (dados.estado !== undefined) setEstado(dados.estado);
    
    // Mudar para o modo de criação
    setModoInterno(ModoInterface.CRIAR);
  };

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
    setPostsRelacionados,
    preencherFormulario
  };
}
