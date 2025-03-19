
import { useState, useEffect } from "react";
import { BlogPost, Region, RegionOrEmpty } from "@/components/blog/types";
import { ModoInterface, MOCK_POSTS } from "../types";
import { fetchBlogPosts } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";

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
  const [categoria, setCategoria] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [tags, setTags] = useState("");
  const [metaDescricao, setMetaDescricao] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState("");
  const [imagemDestaque, setImagemDestaque] = useState("");
  const [regiao, setRegiao] = useState<RegionOrEmpty>("");
  const [estado, setEstado] = useState("");
  const [postsRelacionados, setPostsRelacionados] = useState("");

  // Buscar posts do banco de dados ao carregar o componente
  useEffect(() => {
    const carregarPosts = async () => {
      setLoading(true);
      try {
        const postsData = await fetchBlogPosts();
        if (postsData.length > 0) {
          setPosts(postsData);
        } else {
          setPosts(MOCK_POSTS);
          toast({
            title: "Utilizando dados de exemplo",
            description: "Não foi possível encontrar posts no banco de dados, exibindo dados de exemplo.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        toast({
          title: "Erro ao carregar posts",
          description: "Utilizando dados de exemplo por enquanto.",
          variant: "destructive"
        });
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
