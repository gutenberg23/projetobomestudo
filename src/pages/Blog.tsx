import React, { useState, useEffect } from "react";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { RegionFilter } from "@/components/blog/RegionFilter";
import { StateFilter } from "@/components/blog/StateFilter";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { SidebarPosts } from "@/components/blog/SidebarPosts";
import { LatestNews } from "@/components/blog/LatestNews";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { REGIONS, STATES, CATEGORIES } from "@/data/blogFilters";
import { Region } from "@/components/blog/types";
import { MessageSquare, Heart, Newspaper, Flame, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState(MOCK_BLOG_POSTS);

  // Aplicar filtros aos posts
  useEffect(() => {
    let result = MOCK_BLOG_POSTS;

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => post.title.toLowerCase().includes(term) || post.summary.toLowerCase().includes(term) || post.content.toLowerCase().includes(term) || post.tags?.some(tag => tag.toLowerCase().includes(term)) || post.category.toLowerCase().includes(term));
    }

    // Filtrar por região
    if (activeRegion) {
      result = result.filter(post => post.region === activeRegion);
    }

    // Filtrar por estado
    if (activeState) {
      const stateObj = STATES.find(state => state.id === activeState);
      result = result.filter(post => post.state === activeState || post.region === stateObj?.region);
    }

    // Filtrar por categoria
    if (activeCategory) {
      const categoryObj = CATEGORIES.find(cat => cat.id === activeCategory);
      result = result.filter(post => post.category === categoryObj?.value);
    }
    setFilteredPosts(result);
  }, [searchTerm, activeRegion, activeState, activeCategory]);

  // Posts destacados para o carrossel
  const featuredPosts = MOCK_BLOG_POSTS.filter(post => post.featured).slice(0, 3);

  // Posts mais populares (baseado em curtidas)
  const popularPosts = [...MOCK_BLOG_POSTS].sort((a, b) => b.likesCount - a.likesCount).slice(0, 5);

  // Posts mais comentados
  const mostCommentedPosts = [...MOCK_BLOG_POSTS].sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);

  // Posts mais recentes
  const latestPosts = [...MOCK_BLOG_POSTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const handleSearch = () => {
    // O filtro já é aplicado pelo useEffect
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleRegionSelect = (region: Region | null) => {
    setActiveRegion(region);
    if (region) {
      setActiveState(null);
    }
  };
  const handleStateSelect = (stateId: string | null) => {
    setActiveState(stateId);
    if (stateId) {
      const stateObj = STATES.find(state => state.id === stateId);
      setActiveRegion(stateObj?.region || null);
    }
  };
  const handleCategorySelect = (categoryId: string | null) => {
    setActiveCategory(categoryId);
  };
  return <BlogLayout>
      <BlogHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Filtros de região e estado */}
          <RegionFilter regions={REGIONS} activeRegion={activeRegion} onSelectRegion={handleRegionSelect} />
          
          <StateFilter states={STATES} activeState={activeState} onSelectState={handleStateSelect} regionFilter={activeRegion} />
          
          {/* Posts em destaque (apenas na página inicial sem filtros) */}
          {!searchTerm && !activeRegion && !activeState && !activeCategory && <FeaturedPosts posts={featuredPosts} />}
          
          {/* Próximos concursos */}
          {!searchTerm && !activeRegion && !activeState && !activeCategory && <div className="mb-8">
              <Card>
                <CardHeader className="bg-[#ede7f9]/50 pb-2">
                  <CardTitle className="flex items-center text-lg text-[#272f3c]">
                    <Calendar className="h-5 w-5 mr-2 text-[#5f2ebe]" />
                    Próximos concursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <LatestNews posts={MOCK_BLOG_POSTS.filter(post => post.category === "Concursos").slice(0, 4)} title="" viewAllLink="/blog/categoria/concursos" />
                </CardContent>
              </Card>
            </div>}
          
          {/* Lista de posts filtrados */}
          <BlogList posts={filteredPosts} postsPerPage={6} title={searchTerm || activeRegion || activeState || activeCategory ? "Resultados da busca" : "Todos os artigos"} />
        </div>
        
        <div>
          {/* Filtro de categorias */}
          <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={handleCategorySelect} />
          
          {/* Posts populares */}
          <SidebarPosts posts={popularPosts} title="Posts populares" icon={<Flame className="h-5 w-5 mr-2 text-[#5f2ebe]" />} />
          
          {/* Posts mais comentados */}
          <SidebarPosts posts={mostCommentedPosts} title="Mais comentados" icon={<MessageSquare className="h-5 w-5 mr-2 text-[#5f2ebe]" />} />
          
          {/* Últimas notícias (versão lateral) */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg text-[#272f3c]">
                <Newspaper className="h-5 w-5 mr-2 text-[#5f2ebe]" />
                Últimas notícias
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <LatestNews posts={latestPosts} title="" viewAllLink="/blog" />
            </CardContent>
          </Card>
        </div>
      </div>
    </BlogLayout>;
};
export default Blog;