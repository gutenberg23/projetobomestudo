
import { useState } from "react";
import { BlogPost, Region, RegionOrEmpty } from "@/components/blog/types";
import { ModoInterface, MOCK_POSTS } from "../types";

export function usePostsState() {
  const [modo, setModo] = useState<ModoInterface>(ModoInterface.LISTAR);
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_POSTS);
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
  const [regiao, setRegiao] = useState<RegionOrEmpty>("");
  const [estado, setEstado] = useState("");
  const [postsRelacionados, setPostsRelacionados] = useState("");

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
