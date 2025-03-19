
import React from "react";
import { usePostsState } from "./hooks/usePostsState";
import { usePostsActions } from "./hooks/usePostsActions";
import { ListagemPosts } from "./components/ListagemPosts";
import { FormularioPost } from "./components/FormularioPost";
import { ModoInterface } from "./types";

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
  } = state;

  const { 
    iniciarCriacaoPost, 
    iniciarEdicaoPost, 
    salvarPost, 
    excluirPost 
  } = usePostsActions(state);

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
          categoria={categoria}
          onChangeCategoria={setCategoria}
          destacado={destacado}
          onChangeDestacado={setDestacado}
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
        />
      )}
    </div>
  );
};

export default Posts;
