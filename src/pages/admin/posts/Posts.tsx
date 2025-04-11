import React, { useEffect } from "react";
import { usePostsState } from "./hooks/usePostsState";
import { usePostsActions } from "./hooks/usePostsActions";
import { ListagemPosts } from "./components/ListagemPosts";
import { FormularioPost } from "./components/FormularioPost";
import { ModoInterface, CATEGORIAS } from "./types";
import { CriarPostIA } from "./components/CriarPostIA";

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
    postEditando
  } = state;

  const { 
    iniciarCriacaoPost, 
    iniciarEdicaoPost, 
    salvarPost, 
    excluirPost 
  } = usePostsActions(state);

  // Inicializar a categoria com um valor padrão se estiver vazia
  React.useEffect(() => {
    if (!categoria && CATEGORIAS.length > 0) {
      setCategoria(CATEGORIAS[0]);
    }
  }, [categoria, setCategoria]);

  // Adicionar efeito para loggar mudanças de estado para diagnóstico
  useEffect(() => {
    console.log("Posts.tsx: Modo mudou para:", modo);
    console.log("Posts.tsx: Valores atuais:", {
      titulo,
      resumo,
      conteudo,
      autor,
      categoria,
      tags,
      metaDescricao,
      metaKeywords,
      tempoLeitura,
      regiao,
      estado
    });
  }, [modo, titulo, resumo, conteudo, autor, categoria, tags, metaDescricao, metaKeywords, tempoLeitura, regiao, estado]);

  // Renderização condicional baseada no modo atual
  const currentMode = modo === ModoInterface.LISTAR ? "LISTAR" : modo === ModoInterface.CRIAR ? "CRIAR" : "EDITAR";
  console.log(`Renderizando componente Posts no modo: ${currentMode}`);
  
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
          setTitulo={setTitulo}
          setResumo={setResumo}
          setConteudo={setConteudo}
          setAutor={setAutor}
          setCategoria={setCategoria}
          setTags={setTags}
          setMetaDescricao={setMetaDescricao}
          setMetaKeywords={setMetaKeywords}
          setTempoLeitura={setTempoLeitura}
          setRegiao={setRegiao}
          setEstado={setEstado}
        />
      ) : (
        <>
          <div className="mb-4 text-xs text-gray-500">
            Modo: {currentMode} | 
            Título: {titulo ? "Preenchido" : "Vazio"} | 
            Conteúdo: {conteudo ? "Preenchido" : "Vazio"}
          </div>
          
          {/* Card "Criar Post com IA" adicionado acima do formulário */}
          {modo === ModoInterface.CRIAR && (
            <div className="mb-6">
              <CriarPostIA
                setTitulo={setTitulo}
                setResumo={setResumo}
                setConteudo={setConteudo}
                setAutor={setAutor}
                setCategoria={setCategoria}
                setTags={setTags}
                setMetaDescricao={setMetaDescricao}
                setMetaKeywords={setMetaKeywords}
                setTempoLeitura={setTempoLeitura}
                setRegiao={setRegiao}
                setEstado={setEstado}
                iniciarCriacaoPost={iniciarCriacaoPost}
              />
            </div>
          )}
          
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
            autor={autor}
            onChangeAutor={setAutor}
            autorAvatar={autorAvatar}
            onChangeAutorAvatar={setAutorAvatar}
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
            postId={postEditando?.id}
          />
        </>
      )}
    </div>
  );
};

export default Posts;
