import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogPost } from "@/components/blog/types";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";

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
  "Legislação"
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
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [destacado, setDestacado] = useState(false);
  const [tags, setTags] = useState("");
  const [metaDescricao, setMetaDescricao] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState("");
  
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
    setCategoria(CATEGORIAS[0]);
    setDestacado(false);
    setPostEditando(null);
    setModo(ModoInterface.CRIAR);
  };

  // Iniciar edição de um post existente
  const iniciarEdicaoPost = (post: BlogPost) => {
    setTitulo(post.title);
    setResumo(post.summary);
    setConteudo(post.content);
    setAutor(post.author);
    setCategoria(post.category);
    setDestacado(false);
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
    
    const novoPost: BlogPost = {
      id: postEditando ? postEditando.id : `${Date.now()}`,
      title: titulo,
      summary: resumo,
      content: conteudo,
      author: autor,
      commentCount: postEditando ? postEditando.commentCount : 0,
      likesCount: postEditando ? postEditando.likesCount : 0,
      createdAt: postEditando ? postEditando.createdAt : new Date().toISOString(),
      slug: slug,
      category: categoria,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      metaDescription: metaDescricao || resumo,
      metaKeywords: metaKeywords.split(',').map(k => k.trim()),
      readingTime: readingTimeNumber
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
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Comentários</th>
                <th className="px-4 py-3">Curtidas</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {postsFiltrados.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3">{post.author}</td>
                  <td className="px-4 py-3">{post.category}</td>
                  <td className="px-4 py-3">{format(new Date(post.createdAt), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3">{post.commentCount}</td>
                  <td className="px-4 py-3">{post.likesCount}</td>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-[#67748a]">
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
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input 
              id="tags" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              placeholder="Ex: gramática, redação, concursos"
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
          
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo</Label>
            <textarea 
              id="conteudo" 
              value={conteudo} 
              onChange={(e) => setConteudo(e.target.value)} 
              placeholder="Conteúdo completo do post"
              required
              className="flex h-48 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
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
