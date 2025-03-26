import React, { useState, useEffect } from "react";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { StateFilter } from "@/components/blog/StateFilter";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { SidebarPosts } from "@/components/blog/SidebarPosts";
import { LatestNews } from "@/components/blog/LatestNews";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { STATES, CATEGORIES } from "@/data/blogFilters";
import { fetchBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/components/blog/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MessageSquare } from "lucide-react";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
        post.tags?.some(tag => tag.toLowerCase().includes(term)) || 
        post.category.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (activeState) {
      result = result.filter(post => post.state === activeState);
    }

    // Filtrar por categoria
    if (activeCategory) {
      const categoryObj = CATEGORIES.find(cat => cat.id === activeCategory);
      result = result.filter(post => post.category === categoryObj?.value);
    }
    
    setFilteredPosts(result);
  }, [searchTerm, activeState, activeCategory, allPosts]);

  // Posts destacados para o carrossel
  const featuredPosts = allPosts.filter(post => post.featured).slice(0, 3);

  // Posts mais populares (baseado em curtidas)
  const popularPosts = [...allPosts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 5);

  // Posts mais comentados
  const mostCommentedPosts = [...allPosts].sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);

  // Posts mais recentes
  const latestPosts = [...allPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const handleStateSelect = (stateId: string | null) => {
    setActiveState(stateId);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setActiveCategory(categoryId);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          {/* Filtro de estados - agora ocupa toda a largura */}
          <StateFilter 
            states={STATES} 
            activeState={activeState} 
            onSelectState={handleStateSelect} 
          />
        </div>
        
        <div className="lg:col-span-2">
          {/* Posts em destaque (apenas na página inicial sem filtros) */}
          {!searchTerm && !activeState && !activeCategory && featuredPosts.length > 0 && (
            <FeaturedPosts posts={featuredPosts} />
          )}
          
          {/* Filtro de categorias */}
          <CategoryFilter 
            categories={CATEGORIES} 
            activeCategory={activeCategory} 
            onSelectCategory={handleCategorySelect} 
          />
          
          {/* Listagem de posts */}
          <div className="mt-6">
            <BlogList posts={filteredPosts} />
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhum post encontrado com os filtros selecionados.</p>
                <button 
                  className="mt-4 text-primary hover:underline"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveState(null);
                    setActiveCategory(null);
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
            icon={<TrendingUp className="h-5 w-5 mr-2 text-primary" />}
          />
          
          {/* Posts mais comentados */}
          <SidebarPosts 
            title="Mais Comentados" 
            posts={mostCommentedPosts} 
            icon={<MessageSquare className="h-5 w-5 mr-2 text-primary" />}
          />
          
          {/* Últimas notícias */}
          <LatestNews posts={latestPosts} />
        </div>
      </div>
    </BlogLayout>
  );
};

export default Blog;
