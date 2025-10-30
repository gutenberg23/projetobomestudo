import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Search, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for demonstration
const MOCK_TEORIA_POSTS = [
  {
    id: "1",
    title: "Teoria de Direito Administrativo",
    slug: "teoria-direito-administrativo",
    author: "Prof. João Silva",
    createdAt: new Date().toISOString(),
    summary: "Conceitos fundamentais do Direito Administrativo, princípios e organização administrativa.",
    category: "Direito",
    tags: ["direito", "administrativo", "princípios"],
    viewCount: 1250,
    likesCount: 42
  },
  {
    id: "2",
    title: "Teoria de Direito Constitucional",
    slug: "teoria-direito-constitucional",
    author: "Prof. Maria Oliveira",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    summary: "Estrutura da Constituição Federal, direitos fundamentais e organização do Estado.",
    category: "Direito",
    tags: ["direito", "constitucional", "direitos"],
    viewCount: 980,
    likesCount: 38
  },
  {
    id: "3",
    title: "Teoria de Matemática Financeira",
    slug: "teoria-matematica-financeira",
    author: "Prof. Carlos Santos",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    summary: "Juros simples e compostos, taxas de juros e operações financeiras básicas.",
    category: "Matemática",
    tags: ["matemática", "financeira", "juros"],
    viewCount: 1520,
    likesCount: 56
  },
  {
    id: "4",
    title: "Teoria de Português - Figuras de Linguagem",
    slug: "teoria-portugues-figuras-linguagem",
    author: "Prof. Ana Costa",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    summary: "Principais figuras de linguagem utilizadas na literatura e em textos dissertativos.",
    category: "Português",
    tags: ["português", "literatura", "figuras"],
    viewCount: 870,
    likesCount: 29
  },
  {
    id: "5",
    title: "Teoria de Informática - Redes de Computadores",
    slug: "teoria-informatica-redes-computadores",
    author: "Prof. Roberto Almeida",
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    summary: "Conceitos de redes, protocolos, topologias e segurança em redes de computadores.",
    category: "Informática",
    tags: ["informática", "redes", "protocolos"],
    viewCount: 1120,
    likesCount: 45
  },
  {
    id: "6",
    title: "Teoria de Contabilidade Geral",
    slug: "teoria-contabilidade-geral",
    author: "Prof. Fernanda Lima",
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    summary: "Princípios contábeis, plano de contas e demonstrações contábeis básicas.",
    category: "Contabilidade",
    tags: ["contabilidade", "financeira", "demonstrações"],
    viewCount: 930,
    likesCount: 33
  }
];

const Teorias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching posts data
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // For now, we'll use mock data
        // In a real implementation, this would fetch from an API
        setAllPosts(MOCK_TEORIA_POSTS);
        setFilteredPosts(MOCK_TEORIA_POSTS);
        setLoading(false);
      }, 500);
    };

    loadPosts();
  }, []);

  // Filter posts based on search term
  useEffect(() => {
    let result = [...allPosts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.summary.toLowerCase().includes(term) || 
        post.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredPosts(result);
  }, [searchTerm, allPosts]);

  // Sort posts by creation date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              {/* Page Header */}
              <div className="mb-8">
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-4 w-80" />
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Skeleton className="h-10 w-full pl-10" />
                </div>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-24 mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6 mb-4" />
                      <div className="flex gap-1 mb-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Teorias</h1>
              <p className="text-gray-600">
                Aulas detalhadas com teorias e conceitos importantes para seus estudos.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar teorias..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Posts Grid */}
            {sortedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                          {post.category}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link to={`/teoria/${post.slug}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.summary}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span 
                            key={tag} 
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma teoria encontrada</h3>
                <p className="text-gray-500 mb-4">
                  Não encontramos nenhuma teoria que corresponda à sua busca.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Load More Button */}
            <div className="mt-8 text-center">
              <Button variant="outline" className="w-full md:w-auto">
                Carregar mais teorias
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default Teorias;