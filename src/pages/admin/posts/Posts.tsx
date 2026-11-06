import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePostsState } from "./hooks/usePostsState";
import { usePostsActions } from "./hooks/usePostsActions";
import { ListagemPosts } from "./components/ListagemPosts";
import { FormularioPost } from "./components/FormularioPost";
import { ModoInterface } from "./types";
import { fetchBlogPostByIdFresh } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";

const Posts = () => {
  const state = usePostsState();
  const {
    modo,
    setModo,
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    contagens,
    carregandoLista,
    erroLista,
    postsFiltrados,
    loading,
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
    cursosVinculados,
    setCursosVinculados,
    postEditando,
    currentPage,
    setCurrentPage,
    totalPages,
    totalPosts,
    postsPerPage,
  } = state;

  const { iniciarCriacaoPost, iniciarEdicaoPost, salvarPost, excluirPost, togglePostStatus, toggleDestaque } =
    usePostsActions(state);

  const location = useLocation();
  const navigate = useNavigate();

  // Links do blog abrem o editor com ?edit=<id>; ?novo=1 abre um post em branco
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    const novo = params.get("novo");
    if (!editId && !novo) return;
    // Tira o parâmetro da URL para o editor não reabrir ao voltar para a lista
    navigate("/admin/posts", { replace: true });
    if (novo) {
      iniciarCriacaoPost();
      return;
    }
    const naLista = postsFiltrados.find((p) => p.id === editId);
    if (naLista) {
      iniciarEdicaoPost(naLista);
      return;
    }
    fetchBlogPostByIdFresh(editId!).then((post) => {
      if (post) iniciarEdicaoPost(post);
      else toast({ title: "Post não encontrado", variant: "destructive" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Volta ao topo ao trocar entre lista e editor
  useEffect(() => {
    document.querySelector(".admin-content")?.scrollTo({ top: 0 });
  }, [modo]);

  if (modo === ModoInterface.LISTAR) {
    return (
      <ListagemPosts
        onRecarregar={state.recarregar}
        postsFiltrados={postsFiltrados}
        carregando={carregandoLista}
        erro={erroLista}
        busca={busca}
        onChangeBusca={setBusca}
        statusFiltro={statusFiltro}
        onChangeStatusFiltro={setStatusFiltro}
        contagens={contagens}
        onIniciarCriacaoPost={iniciarCriacaoPost}
        onIniciarEdicaoPost={iniciarEdicaoPost}
        onExcluirPost={excluirPost}
        onToggleStatus={togglePostStatus}
        onToggleDestaque={toggleDestaque}
        currentPage={currentPage}
        totalPages={totalPages}
        totalPosts={totalPosts}
        postsPerPage={postsPerPage}
        onPageChange={setCurrentPage}
      />
    );
  }

  return (
    <FormularioPost
      modo={modo}
      onVoltar={() => setModo(ModoInterface.LISTAR)}
      onSalvar={salvarPost}
      salvando={loading}
      titulo={titulo}
      onChangeTitulo={setTitulo}
      resumo={resumo}
      onChangeResumo={setResumo}
      conteudo={conteudo}
      onChangeConteudo={setConteudo}
      categoria={categoria}
      onChangeCategoria={setCategoria}
      destacado={destacado}
      onChangeDestacado={setDestacado}
      isDraft={isDraft}
      onChangeIsDraft={setIsDraft}
      tags={tags}
      onChangeTags={setTags}
      metaDescricao={metaDescricao}
      onChangeMetaDescricao={setMetaDescricao}
      metaKeywords={metaKeywords}
      onChangeMetaKeywords={setMetaKeywords}
      imagemDestaque={imagemDestaque}
      onChangeImagemDestaque={setImagemDestaque}
      regiao={regiao}
      onChangeRegiao={setRegiao}
      estado={estado}
      onChangeEstado={setEstado}
      postsRelacionados={postsRelacionados}
      onChangePostsRelacionados={setPostsRelacionados}
      cursosVinculados={cursosVinculados}
      onChangeCursosVinculados={setCursosVinculados}
      postId={postEditando?.id}
      postSlug={postEditando?.slug}
      postAutor={postEditando?.author}
      postCriadoEm={postEditando?.createdAt}
      publicadoNoBanco={postEditando ? !postEditando.isDraft : false}
    />
  );
};

export default Posts;
