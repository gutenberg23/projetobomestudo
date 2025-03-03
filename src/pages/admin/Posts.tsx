
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogPost, Region, RegionOrEmpty, StateFilter } from "@/components/blog/types";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

// Mock de posts para a listagem
const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Dicas para provas de Português em concursos públicos",
    summary: "Confira nossas dicas essenciais para se destacar nas provas de língua portuguesa em concursos públicos.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Maria Silva",
    commentCount: 15,
    likesCount: 32,
    createdAt: "2023-10-15T14:30:00Z",
    slug: "dicas-para-provas-de-portugues",
    category: "Português"
  },
  {
    id: "2",
    title: "Como estudar para concursos jurídicos",
    summary: "Aprenda métodos eficientes para estudar direito e conquistar sua aprovação em concursos jurídicos.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Carlos Mendes",
    commentCount: 8,
    likesCount: 24,
    createdAt: "2023-10-10T09:45:00Z",
    slug: "como-estudar-para-concursos-juridicos",
    category: "Direito"
  },
  {
    id: "3",
    title: "Matemática para concursos: fórmulas essenciais",
    summary: "Domine as principais fórmulas matemáticas cobradas em provas de concursos públicos.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Fernando Costa",
    commentCount: 5,
    likesCount: 18,
    createdAt: "2023-09-28T11:20:00Z",
    slug: "matematica-para-concursos-formulas-essenciais",
    category: "Matemática"
  },
];

// Categorias disponíveis
const CATEGORIAS = [
  "Português",
  "Matemática",
  "Direito",
  "Informática",
  "Raciocínio Lógico",
  "Atualidades",
  "Legislação",
  "Concursos",
  "Dicas de Estudo",
  "Notícias"
];

// Regiões disponíveis
const REGIOES: Region[] = [
  "Norte",
  "Nordeste", 
  "Centro-Oeste", 
  "Sudeste", 
  "Sul", 
  "Federal", 
  "Nacional"
];

// Estados disponíveis
const ESTADOS: StateFilter[] = [
  { id: "ac", name: "Acre", value: "AC", region: "Norte" },
  { id: "al", name: "Alagoas", value: "AL", region: "Nordeste" },
  { id: "ap", name: "Amapá", value: "AP", region: "Norte" },
  { id: "am", name: "Amazonas", value: "AM", region: "Norte" },
  { id: "ba", name: "Bahia", value: "BA", region: "Nordeste" },
  { id: "ce", name: "Ceará", value: "CE", region: "Nordeste" },
  { id: "df", name: "Distrito Federal", value: "DF", region: "Centro-Oeste" },
  { id: "es", name: "Espírito Santo", value: "ES", region: "Sudeste" },
  { id: "go", name: "Goiás", value: "GO", region: "Centro-Oeste" },
  { id: "ma", name: "Maranhão", value: "MA", region: "Nordeste" },
  { id: "mt", name: "Mato Grosso", value: "MT", region: "Centro-Oeste" },
  { id: "ms", name: "Mato Grosso do Sul", value: "MS", region: "Centro-Oeste" },
  { id: "mg", name: "Minas Gerais", value: "MG", region: "Sudeste" },
  { id: "pa", name: "Pará", value: "PA", region: "Norte" },
  { id: "pb", name: "Paraíba", value: "PB", region: "Nordeste" },
  { id: "pr", name: "Paraná", value: "PR", region: "Sul" },
  { id: "pe", name: "Pernambuco", value: "PE", region: "Nordeste" },
  { id: "pi", name: "Piauí", value: "PI", region: "Nordeste" },
  { id: "rj", name: "Rio de Janeiro", value: "RJ", region: "Sudeste" },
  { id: "rn", name: "Rio Grande do Norte", value: "RN", region: "Nordeste" },
  { id: "rs", name: "Rio Grande do Sul", value: "RS", region: "Sul" },
  { id: "ro", name: "Rondônia", value: "RO", region: "Norte" },
  { id: "rr", name: "Roraima", value: "RR", region: "Norte" },
  { id: "sc", name: "Santa Catarina", value: "SC", region: "Sul" },
  { id: "sp", name: "São Paulo", value: "SP", region: "Sudeste" },
  { id: "se", name: "Sergipe", value: "SE", region: "Nordeste" },
  { id: "to", name: "Tocantins", value: "TO", region: "Norte" }
];

// Enum para controlar o modo da interface
enum ModoInterface {
  LISTAR,
  CRIAR,
  EDITAR
}

const Posts = () => {
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
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
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

  // Iniciar criação de um novo post
  const iniciarCriacaoPost = () => {
    setTitulo("");
    setResumo("");
    setConteudo("");
    setAutor("");
    setAutorAvatar("");
    setCategoria(CATEGORIAS[0]);
    setDestacado(false);
    setTags("");
    setMetaDescricao("");
    setMetaKeywords("");
    setTempoLeitura("");
    setImagemDestaque("");
    setRegiao("");
    setEstado("");
    setPostsRelacionados("");
    setPostEditando(null);
    setModo(ModoInterface.CRIAR);
  };

  // Iniciar edição de um post existente
  const iniciarEdicaoPost = (post: BlogPost) => {
    setTitulo(post.title);
    setResumo(post.summary);
    setConteudo(post.content);
    setAutor(post.author);
    setAutorAvatar(post.authorAvatar || "");
    setCategoria(post.category);
    setDestacado(post.featured || false);
    setTags(post.tags ? post.tags.join(", ") : "");
    setMetaDescricao(post.metaDescription || "");
    setMetaKeywords(post.metaKeywords ? post.metaKeywords.join(", ") : "");
    setTempoLeitura(post.readingTime ? post.readingTime.toString() : "");
    setImagemDestaque(post.featuredImage || "");
    setRegiao(post.region || "");
    setEstado(post.state || "");
    setPostsRelacionados(post.relatedPosts ? post.relatedPosts.join(", ") : "");
    setPostEditando(post);
    setModo(ModoInterface.EDITAR);
  };

  // Salvar um post (novo ou editado)
  const salvarPost = () => {
    const slug = titulo
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Convert the comma-separated tags into an array
    const tagsArray = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Parse reading time as number
    const readingTimeNumber = tempoLeitura ? parseInt(tempoLeitura, 10) : 
      Math.ceil(conteudo.split(' ').length / 200);
    
    // Convert related posts to array
    const relatedPostsArray = postsRelacionados.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    // Convert meta keywords to array
    const metaKeywordsArray = metaKeywords.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    const novoPost: BlogPost = {
      id: postEditando ? postEditando.id : `${Date.now()}`,
      title: titulo,
      summary: resumo,
      content: conteudo,
      author: autor,
      authorAvatar: autorAvatar || undefined,
      commentCount: postEditando ? postEditando.commentCount : 0,
      likesCount: postEditando ? postEditando.likesCount : 0,
      createdAt: postEditando ? postEditando.createdAt : new Date().toISOString(),
      slug: slug,
      category: categoria,
      region: regiao as Region || undefined,
      state: estado || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      metaDescription: metaDescricao || resumo,
      metaKeywords: metaKeywordsArray.length > 0 ? metaKeywordsArray : undefined,
      featuredImage: imagemDestaque || undefined,
      readingTime: readingTimeNumber,
      relatedPosts: relatedPostsArray.length > 0 ? relatedPostsArray : undefined,
      featured: destacado
    };

    if (modo === ModoInterface.EDITAR && postEditando) {
      // Atualiza o post existente
      setPosts(posts.map(post => post.id === postEditando.id ? novoPost : post));
    } else {
      // Adiciona um novo post
      setPosts([novoPost, ...posts]);
    }

    // Volta para a listagem
    setModo(ModoInterface.LISTAR);
  };

  // Excluir um post
  const excluirPost = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  // Filtrar estados por região selecionada
  const estadosFiltrados = regiao 
    ? ESTADOS.filter(estado => estado.region === regiao) 
    : ESTADOS;

  // Componente para listagem de posts
  const ListagemPosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#272f3c]">Posts</h1>
        <Button onClick={iniciarCriacaoPost} className="bg-[#ea2be2] hover:bg-[#d029d5]">
          <Plus className="h-4 w-4 mr-2" />
          Novo Post
        </Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#67748a]" />
          <Input 
            className="pl-10" 
            placeholder="Buscar posts por título, autor ou categoria..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#67748a] bg-gray-50 uppercase">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Região</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Comentários</th>
                <th className="px-4 py-3">Curtidas</th>
                <th className="px-4 py-3">Destaque</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {postsFiltrados.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3">{post.author}</td>
                  <td className="px-4 py-3">{post.category}</td>
                  <td className="px-4 py-3">{post.region || '—'}</td>
                  <td className="px-4 py-3">{format(new Date(post.createdAt), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3">{post.commentCount}</td>
                  <td className="px-4 py-3">{post.likesCount}</td>
                  <td className="px-4 py-3">
                    {post.featured ? (
                      <span className="bg-[#fce7fc] text-[#ea2be2] text-xs px-2 py-1 rounded-full">
                        Destaque
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => iniciarEdicaoPost(post)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => excluirPost(post.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {postsFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#67748a]">
                    Nenhum post encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Componente para formulário de criação/edição
  const FormularioPost = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#272f3c]">
          {modo === ModoInterface.CRIAR ? "Novo Post" : "Editar Post"}
        </h1>
        <Button 
          variant="outline" 
          onClick={() => setModo(ModoInterface.LISTAR)}
        >
          Voltar
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          salvarPost();
        }}>
          {/* Informações Básicas */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Informações Básicas</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input 
                  id="titulo" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  placeholder="Título do post"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo</Label>
                <Input 
                  id="resumo" 
                  value={resumo} 
                  onChange={(e) => setResumo(e.target.value)} 
                  placeholder="Breve resumo do post"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autor">Autor</Label>
                <Input 
                  id="autor" 
                  value={autor} 
                  onChange={(e) => setAutor(e.target.value)} 
                  placeholder="Nome do autor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autorAvatar">Avatar do Autor (URL)</Label>
                <Input 
                  id="autorAvatar" 
                  value={autorAvatar} 
                  onChange={(e) => setAutorAvatar(e.target.value)} 
                  placeholder="URL da imagem do avatar do autor"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tempoLeitura">Tempo de leitura (minutos)</Label>
                  <Input 
                    id="tempoLeitura" 
                    type="number" 
                    value={tempoLeitura} 
                    onChange={(e) => setTempoLeitura(e.target.value)} 
                    placeholder="Estimativa do tempo de leitura em minutos"
                  />
                  <p className="text-xs text-[#67748a]">Deixe vazio para calcular automaticamente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Conteúdo</h3>
            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo Completo</Label>
              <Textarea 
                id="conteudo" 
                value={conteudo} 
                onChange={(e) => setConteudo(e.target.value)} 
                placeholder="Conteúdo completo do post"
                required
                className="h-48"
                richText
              />
            </div>
          </div>
          
          {/* Regionalização */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Regionalização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regiao">Região</Label>
                <Select value={regiao} onValueChange={value => {
                  setRegiao(value as Region);
                  setEstado("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Nenhuma</SelectItem>
                    {REGIOES.map(reg => (
                      <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={estado} 
                  onValueChange={setEstado}
                  disabled={!regiao || regiao === "Federal" || regiao === "Nacional"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Nenhum</SelectItem>
                    {estadosFiltrados.map(estado => (
                      <SelectItem key={estado.id} value={estado.value}>{estado.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Metadados e SEO */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Metadados e SEO</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input 
                  id="tags" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)} 
                  placeholder="Ex: gramática, redação, concursos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescricao">Meta Descrição (para SEO)</Label>
                <Input 
                  id="metaDescricao" 
                  value={metaDescricao} 
                  onChange={(e) => setMetaDescricao(e.target.value)} 
                  placeholder="Descrição para motores de busca (se vazio, será usado o resumo)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Palavras-chave (separadas por vírgula)</Label>
                <Input 
                  id="metaKeywords" 
                  value={metaKeywords} 
                  onChange={(e) => setMetaKeywords(e.target.value)} 
                  placeholder="Ex: concursos, português, estudos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postsRelacionados">IDs dos Posts Relacionados (separados por vírgula)</Label>
                <Input 
                  id="postsRelacionados" 
                  value={postsRelacionados} 
                  onChange={(e) => setPostsRelacionados(e.target.value)} 
                  placeholder="Ex: 1, 5, 12"
                />
              </div>
            </div>
          </div>
          
          {/* Mídia */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Mídia</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imagemDestaque">URL da Imagem Destaque</Label>
                <Input 
                  id="imagemDestaque" 
                  value={imagemDestaque} 
                  onChange={(e) => setImagemDestaque(e.target.value)} 
                  placeholder="URL da imagem destaque do post"
                />
              </div>
              
              {imagemDestaque && (
                <div className="border rounded-md overflow-hidden h-40 w-full md:w-1/2 bg-gray-100">
                  <img 
                    src={imagemDestaque} 
                    alt="Imagem Destaque" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Opções de Destaque */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Opções de Destaque</h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="destacado" 
                checked={destacado} 
                onCheckedChange={(checked) => setDestacado(!!checked)} 
              />
              <Label htmlFor="destacado" className="font-normal">
                Destacar post na página inicial
              </Label>
            </div>
            <p className="text-xs text-[#67748a] mt-2">
              Posts destacados aparecem com destaque visual na página principal do blog e no topo da listagem.
            </p>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setModo(ModoInterface.LISTAR)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#ea2be2] hover:bg-[#d029d5]"
            >
              {modo === ModoInterface.CRIAR ? "Criar Post" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderização condicional baseada no modo atual
  return (
    <div className="container mx-auto px-4 py-6">
      {modo === ModoInterface.LISTAR ? (
        <ListagemPosts />
      ) : (
        <FormularioPost />
      )}
    </div>
  );
};

export default Posts;
