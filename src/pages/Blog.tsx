import { useState, useEffect, useMemo } from "react";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { BlogList } from "@/components/blog/BlogList";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { StateFilter } from "@/components/blog/StateFilter";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { TagFilter } from "@/components/blog/TagFilter";
import { LatestNews } from "@/components/blog/LatestNews";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { STATES, CATEGORIES } from "@/data/blogFilters";
import { fetchBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/components/blog/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Search, X } from "lucide-react";
import { getTagsByPopularity } from "@/components/blog/utils";

import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import AdBanner from '@/components/ads/AdBanner';
import { PublicLayout } from "@/components/layout/PublicLayout";

const Blog = () => {
  const { category: categoryParam, tag: tagParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  // ?estado=sp (ou ?estado=são paulo) vem da etiqueta de estado dos cards
  const [activeState, setActiveState] = useState<string | null>(() => {
    const estado = searchParams.get("estado")?.toLowerCase();
    if (!estado) return null;
    const found = STATES.find(s => s.id === estado || s.name.toLowerCase() === estado || s.value.toLowerCase() === estado);
    return found?.id ?? null;
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar posts do banco de dados
  useEffect(() => {
    let isMounted = true;
    
    const loadPosts = async () => {
      setLoading(true);
      try {
        const posts = await fetchBlogPosts();
        
        if (isMounted) {
          // Se temos dados reais, usar eles
          if (posts.length > 0) {
            setAllPosts(posts);
            setFilteredPosts(posts);
          } 
          // Se não temos dados e não temos posts já carregados, usar mock
          else if (allPosts.length === 0) {
            setAllPosts(MOCK_BLOG_POSTS);
            setFilteredPosts(MOCK_BLOG_POSTS);
          }
          // Se já temos posts carregados, manter os atuais
        }
      } catch (error) {
        console.error("Erro ao carregar posts do blog:", error);
        
        // Só usar mock se ainda não temos posts carregados
        if (isMounted && allPosts.length === 0) {
          setAllPosts(MOCK_BLOG_POSTS);
          setFilteredPosts(MOCK_BLOG_POSTS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPosts();
    
    return () => {
      isMounted = false;
    };
  }, []); // Remover allPosts da dependência para evitar loops

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
    
    // Filtrar por categoria
    if (activeCategory) {
      const selectedCategory = CATEGORIES.find(c => c.id === activeCategory);
      if (selectedCategory) {
        result = result.filter(post => 
          post.category && post.category.toLowerCase() === selectedCategory.value.toLowerCase()
        );
      }
    }
    
    // Filtrar por tag
    if (activeTag) {
      result = result.filter(post => 
        post.tags && post.tags.some(t => t.toLowerCase() === activeTag.toLowerCase())
      );
    }
    
    // Filtrar por categoria (se houver parâmetro na URL)
    if (categoryParam) {
      result = result.filter(post => 
        post.category && post.category.toLowerCase() === categoryParam.toLowerCase()
      );
    }
    
    // Filtrar por tag (se houver parâmetro na URL)
    if (tagParam) {
      result = result.filter(post => 
        post.tags && post.tags.some(t => t.toLowerCase() === tagParam.toLowerCase())
      );
    }
    
    setFilteredPosts(result);
  }, [searchTerm, activeState, activeCategory, activeTag, allPosts, categoryParam, tagParam]);

  // Tags ordenadas pelas mais usadas (a lateral mostra só as primeiras)
  const allTags = useMemo(() => getTagsByPopularity(allPosts), [allPosts]);

  const hasFilters = Boolean(searchTerm || activeState || activeCategory || activeTag || categoryParam || tagParam);

  // Memorizado para a paginação só voltar à página 1 quando a lista muda de fato
  const listPosts = useMemo(
    () => (hasFilters ? filteredPosts : filteredPosts.filter(post => !post.featured)),
    [filteredPosts, hasFilters]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setActiveState(null);
    setActiveCategory(null);
    setActiveTag(null);
    if (categoryParam || tagParam || searchParams.get("estado")) navigate("/blog");
  };

  const filterLabel = categoryParam ? `Categoria: ${categoryParam}` :
    tagParam ? `Tag: #${tagParam}` :
    activeCategory ? `Categoria: ${CATEGORIES.find(c => c.id === activeCategory)?.name}` :
    activeTag ? `Tag: #${activeTag}` :
    activeState ? `Estado: ${STATES.find(s => s.id === activeState)?.value}` :
    searchTerm ? `Busca: “${searchTerm}”` : '';

  // Posts destacados para o carrossel
  const featuredPosts = allPosts.filter(post => post.featured).slice(0, 4);


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

  const handleTagSelect = (tag: string | null) => {
    setActiveTag(tag);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
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
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-[rgb(242,244,246)]">
        <BlogLayout>
          {/* Busca + filtros de estado */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa3b2]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar notícias..."
                aria-label="Buscar notícias"
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-white text-sm text-[#272f3c] placeholder:text-[#9aa3b2] focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30 focus:border-[#5f2ebe] [&::-webkit-search-cancel-button]:hidden"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#9aa3b2] hover:text-[#272f3c]"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <StateFilter 
                states={STATES} 
                activeState={activeState} 
                onSelectState={handleStateSelect} 
              />
            </div>
          </div>
          
          {/* Posts em destaque - ocupa toda a largura */}
          {!hasFilters && featuredPosts.length > 0 && (
            <FeaturedPosts posts={featuredPosts} />
          )}
          
          {/* Banner de concursos */}
          {!hasFilters && (
            <div className="my-8">
              <div className="mb-6 empty:hidden">
                <AdBanner position="blog_top_concursos" className="rounded-lg" />
              </div>
              <Link to="/concursos" className="block group">
                <div className="bg-gradient-to-r from-[#5f2ebe] to-[#7e4beb] rounded-lg px-5 py-4 md:p-6 text-white shadow-md group-hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center min-w-0">
                      <Search className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4 shrink-0" />
                      <h3 className="text-base md:text-xl font-bold">Veja todos os concursos abertos</h3>
                    </div>
                    <div className="flex items-center shrink-0">
                      <span className="mr-2 hidden sm:inline">Acessar agora</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
          
          {/* Título do filtro ativo, com contagem e atalho para limpar */}
          {hasFilters && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#272f3c]">{filterLabel}</h1>
                <p className="text-[#67748a]">
                  {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5f2ebe] bg-white border border-[#5f2ebe]/30 px-3 py-1.5 rounded-md hover:bg-[#ede7f9] transition-colors"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </button>
            </div>
          )}
          
          {/* Layout de duas colunas abaixo dos destaques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {listPosts.length > 0 ? (
                <BlogList posts={listPosts} showEmpty={false} />
              ) : (
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-[#272f3c] mb-1">Nenhum post encontrado</h3>
                  <p className="text-[#67748a]">Tente outra busca ou remova algum filtro.</p>
                  {hasFilters && (
                    <button 
                      className="mt-4 text-[#5f2ebe] font-medium hover:underline"
                      onClick={clearFilters}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <aside className="space-y-6">
              {/* Últimas notícias */}
              <div className="bg-white rounded-lg shadow-sm p-5">
                <LatestNews posts={latestPosts} />
              </div>
              
              <CategoryFilter 
                categories={CATEGORIES} 
                activeCategory={activeCategory} 
                onSelectCategory={handleCategorySelect} 
              />
              
              <TagFilter 
                tags={allTags} 
                activeTag={activeTag} 
                onSelectTag={handleTagSelect} 
              />
            </aside>
          </div>
        </BlogLayout>
      </div>
    </PublicLayout>
  );
};

export default Blog;