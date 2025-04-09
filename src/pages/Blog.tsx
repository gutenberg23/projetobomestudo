import { useState, useEffect } from "react";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { StateFilter } from "@/components/blog/StateFilter";
import { LatestNews } from "@/components/blog/LatestNews";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { STATES } from "@/data/blogFilters";
import { fetchBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/components/blog/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { SidebarPosts } from "@/components/blog/SidebarPosts";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeState, setActiveState] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar posts do banco de dados
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const posts = await fetchBlogPosts();
        setAllPosts(posts.length > 0 ? posts : MOCK_BLOG_POSTS);
        setFilteredPosts(posts.length > 0 ? posts : MOCK_BLOG_POSTS);
      } catch (error) {
        console.error("Erro ao carregar posts do blog:", error);
        setAllPosts(MOCK_BLOG_POSTS);
        setFilteredPosts(MOCK_BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Aplicar filtros aos posts
  useEffect(() => {
    let result = [...allPosts];

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.summary.toLowerCase().includes(term) || 
        post.content.toLowerCase().includes(term) || 
        post.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtrar por estado
    if (activeState) {
      const selectedState = STATES.find(s => s.id === activeState);
      if (selectedState) {
        result = result.filter(post => 
          // Verificar se o estado do post corresponde ao estado selecionado (nome ou sigla)
          (post.state && 
            (post.state.toLowerCase() === selectedState.value.toLowerCase() || 
             post.state.toLowerCase() === selectedState.name.toLowerCase()))
        );
      }
    }
    
    setFilteredPosts(result);
  }, [searchTerm, activeState, allPosts]);

  // Posts destacados para o carrossel
  const featuredPosts = allPosts.filter(post => post.featured).slice(0, 3);

  // Posts mais populares (baseado em curtidas)
  const popularPosts = [...allPosts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 5);

  // Posts mais recentes
  const latestPosts = [...allPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const handleStateSelect = (stateId: string | null) => {
    setActiveState(stateId);
  };

  if (loading) {
    return (
      <BlogLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      {/* Filtro de estados - ocupa toda a largura */}
      <div className="mb-6">
        <StateFilter 
          states={STATES} 
          activeState={activeState} 
          onSelectState={handleStateSelect} 
        />
      </div>
      
      {/* Posts em destaque - ocupa toda a largura */}
      {!searchTerm && !activeState && featuredPosts.length > 0 && (
        <FeaturedPosts posts={featuredPosts} />
      )}
      
      {/* Layout de duas colunas abaixo dos destaques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Título da seção de posts */}
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-[#272f3c]">Todos os Posts</h2>
            <div className="ml-4 flex-1 h-0.5 bg-gray-200"></div>
          </div>
          
          {/* Listagem de posts */}
          <div>
            <BlogList posts={filteredPosts} />
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhum post encontrado com os filtros selecionados.</p>
                <button 
                  className="mt-4 text-[#5f2ebe] hover:underline"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveState(null);
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Posts populares */}
          <SidebarPosts 
            title="Posts Populares" 
            posts={popularPosts} 
            icon={<TrendingUp className="h-5 w-5 mr-2 text-[#5f2ebe]" />}
          />
          
          {/* Últimas notícias */}
          <LatestNews posts={latestPosts} />
        </div>
      </div>
    </BlogLayout>
  );
};

export default Blog;
