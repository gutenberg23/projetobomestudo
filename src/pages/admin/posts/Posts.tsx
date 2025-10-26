import React, { useEffect } from "react";
import { usePostsState } from "./hooks/usePostsState";
import { usePostsActions } from "./hooks/usePostsActions";
import { ListagemPosts } from "./components/ListagemPosts";
import { FormularioPost } from "./components/FormularioPost";
import { ModoInterface, CATEGORIAS } from "./types";
import { useLocation } from "react-router-dom";

const Posts = () => {
  const state = usePostsState();
  const { 
    modo, 
    setModo, 
    busca, 
    setBusca, 
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
    postEditando
  } = state;

  const { 
    iniciarCriacaoPost, 
    iniciarEdicaoPost, 
    salvarPost, 
    excluirPost,
    togglePostStatus
  } = usePostsActions(state);
  
  const location = useLocation();

  // Verificar se há um parâmetro de edição na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const editPostId = urlParams.get('edit');
    
    if (editPostId && modo === ModoInterface.LISTAR) {
      // Encontrar o post pelo ID
      const postToEdit = postsFiltrados.find(post => post.id === editPostId);
      if (postToEdit) {
        iniciarEdicaoPost(postToEdit);
      }
    }
  }, [location.search, modo, postsFiltrados, iniciarEdicaoPost]);

  // Inicializar a categoria com um valor padrão se estiver vazia
  React.useEffect(() => {
    if (!categoria && CATEGORIAS.length > 0) {
      setCategoria(CATEGORIAS[0]);
    }
  }, [categoria, setCategoria]);

  // Renderização condicional baseada no modo atual
  return (
    <div className="container mx-auto px-4 py-6">
      {modo === ModoInterface.LISTAR ? (
        <ListagemPosts 
          postsFiltrados={postsFiltrados}
          busca={busca}
          onChangeBusca={setBusca}
          onIniciarCriacaoPost={iniciarCriacaoPost}
          onIniciarEdicaoPost={iniciarEdicaoPost}
          onExcluirPost={excluirPost}
          onToggleStatus={togglePostStatus}
        />
      ) : (
        <FormularioPost 
          modo={modo}
          onVoltar={() => setModo(ModoInterface.LISTAR)}
          onSalvar={salvarPost}
          titulo={titulo}
          onChangeTitulo={setTitulo}
          resumo={resumo}
          onChangeResumo={setResumo}
          conteudo={conteudo}
          onChangeConteudo={setConteudo}
          autorAvatar={autorAvatar}
          onChangeAutorAvatar={setAutorAvatar}
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
          tempoLeitura={tempoLeitura}
          onChangeTempoLeitura={setTempoLeitura}
          imagemDestaque={imagemDestaque}
          onChangeImagemDestaque={setImagemDestaque}
          regiao={regiao}
          onChangeRegiao={setRegiao}
          estado={estado}
          onChangeEstado={setEstado}
          postsRelacionados={postsRelacionados}
          onChangePostsRelacionados={setPostsRelacionados}
          postId={postEditando?.id}
          postSlug={postEditando?.slug}
        />
      )}
    </div>
  );
};

export default Posts;