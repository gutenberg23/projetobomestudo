import { useState, useEffect, useCallback, useRef } from "react";
import { BlogPost, Region } from "@/components/blog/types";
import { ModoInterface } from "../types";
import {
  AdminPostStatus,
  fetchAdminBlogPosts,
  fetchAdminPostCounts,
} from "@/services/blogService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

const CONTAGENS_VAZIAS: Record<AdminPostStatus, number> = { todos: 0, publicados: 0, rascunhos: 0, destaques: 0 };

export function usePostsState() {
  const { user } = useAuth();
  const { isJornalista } = usePermissions();
  const [modo, setModo] = useState<ModoInterface>(ModoInterface.LISTAR);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [statusFiltro, setStatusFiltroState] = useState<AdminPostStatus>("todos");
  const [contagens, setContagens] = useState(CONTAGENS_VAZIAS);
  const [postEditando, setPostEditando] = useState<BlogPost | null>(null);
  const [versaoLista, setVersaoLista] = useState(0);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 20;

  // Jornalistas só veem e editam os próprios posts (filtro no servidor)
  const autorFiltro = isJornalista() && user?.nome ? user.nome : undefined;

  // Busca com atraso para não consultar o banco a cada tecla
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  const setStatusFiltro = useCallback((status: AdminPostStatus) => {
    setStatusFiltroState(status);
    setCurrentPage(1);
  }, []);

  const recarregar = useCallback(() => setVersaoLista((v) => v + 1), []);

  // Evita que uma resposta antiga sobrescreva uma busca mais nova
  const requisicaoAtual = useRef(0);

  useEffect(() => {
    const id = ++requisicaoAtual.current;
    setCarregandoLista(true);
    setErroLista(null);
    fetchAdminBlogPosts({
      page: currentPage,
      limit: postsPerPage,
      search: buscaAplicada,
      status: statusFiltro,
      author: autorFiltro,
    })
      .then(({ posts: postsData, totalCount }) => {
        if (id !== requisicaoAtual.current) return;
        setPosts(postsData);
        setTotalPosts(totalCount);
      })
      .catch((error) => {
        if (id !== requisicaoAtual.current) return;
        console.error("Erro ao carregar posts:", error);
        setPosts([]);
        setTotalPosts(0);
        setErroLista("Não foi possível carregar os posts. Tente recarregar a página.");
      })
      .finally(() => {
        if (id === requisicaoAtual.current) setCarregandoLista(false);
      });
  }, [currentPage, buscaAplicada, statusFiltro, autorFiltro, versaoLista]);

  useEffect(() => {
    fetchAdminPostCounts(autorFiltro)
      .then(setContagens)
      .catch(() => setContagens(CONTAGENS_VAZIAS));
  }, [autorFiltro, versaoLista]);

  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [destacado, setDestacado] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [tags, setTags] = useState("");
  const [metaDescricao, setMetaDescricao] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [imagemDestaque, setImagemDestaque] = useState("");
  const [regiao, setRegiao] = useState<Region | "none">("none");
  const [estado, setEstado] = useState("none"); // Alterado de string para "none"
  const [postsRelacionados, setPostsRelacionados] = useState("");

  const postsFiltrados = posts;

  // Calcular o número total de páginas
  const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));

  return {
    modo,
    setModo,
    posts,
    setPosts,
    loading,
    setLoading,
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    contagens,
    carregandoLista,
    erroLista,
    recarregar,
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
    isDraft,
    setIsDraft,
    tags,
    setTags,
    metaDescricao,
    setMetaDescricao,
    metaKeywords,
    setMetaKeywords,
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
    totalPosts,
    postsPerPage
  };
}