import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  MessageSquare, 
  Heart, 
  Clock, 
  ArrowLeft, 
  Tag, 
  BookOpen, 
  Share2, 
  User,
  Bookmark,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/components/blog/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { SidebarPosts } from "@/components/blog/SidebarPosts";
import { LatestNews } from "@/components/blog/LatestNews";
import { CATEGORIES } from "@/data/blogFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBlogPostBySlug, fetchBlogPosts, incrementLikes } from "@/services/blogService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
// Importar o CSS do blog
import "../../styles/blog.css";

// Estilo inline para o caso do CSS não carregar - versão simplificada
const inlineTableStyles = `
<style>
table { font-size:0.65rem; line-height:0.85; border-collapse:collapse; width:100%; }
th, td { padding:0.2rem 0.3rem; font-size:0.65rem; border:1px solid #ddd; vertical-align:top; }
td p, th p { margin:0; padding:0; font-size:0.65rem; }
.overflow-x-auto { width:100%; overflow-x:auto; display:block; }
@media (max-width:768px) {
  table { width:100%; }
  .overflow-x-auto { overflow-x:auto; }
}
</style>
`;

// Estilo global para garantir visibilidade
const GlobalStyle = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    main { display: block !important; visibility: visible !important; }
    article { display: block !important; visibility: visible !important; }
    .overflow-x-hidden { overflow-x: visible !important; }
  `}} />
);

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const { user } = useAuth();
  
  // Buscar o post com base no slug
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        navigate('/blog');
        return;
      }

      setLoading(true);
      try {
        // Buscar o post específico
        const fetchedPost = await fetchBlogPostBySlug(slug);
        
        if (!fetchedPost) {
          setError('Post não encontrado');
          setLoading(false);
          return;
        }
        
        setPost(fetchedPost);
        setCommentCount(fetchedPost.commentCount || 0);

        // Buscar todos os posts para relacionados
        const posts = await fetchBlogPosts();
        setAllPosts(posts.length > 0 ? posts : MOCK_BLOG_POSTS);
        
        // Filtrar posts relacionados (mesma categoria, excluindo o atual)
        const related = posts
          .filter(p => p.id !== fetchedPost.id && p.category === fetchedPost.category)
          .slice(0, 3);
        
        setRelatedPosts(related);
        
        // Verificar se o post está curtido
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setIsLiked(likedPosts.includes(fetchedPost.id));
        
        // Verificar se o post está nos favoritos
        const bookmarkedPosts = JSON.parse(localStorage.getItem('bookmarkedPosts') || '[]');
        setIsBookmarked(bookmarkedPosts.includes(fetchedPost.id));
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar post:', error);
        setError('Erro ao carregar o post');
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);
  
  // Encontrar posts relacionados - na mesma categoria ou com tags em comum
  const relatedPostsList = post && allPosts.length > 0
    ? allPosts.filter(p => 
        p.id !== post.id && 
        (p.category === post.category || 
          (p.tags && post.tags && p.tags.some(tag => post.tags?.includes(tag))))
      ).slice(0, 3) 
    : [];
  
  // Posts da mesma categoria
  const sameCategoryPosts = post && allPosts.length > 0
    ? allPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 4)
    : [];
  
  // Posts mais recentes
  const latestPosts = allPosts.length > 0
    ? [...allPosts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .filter(p => p.id !== post?.id)
        .slice(0, 5)
    : [];
  
  // Atualizar o título da página e adicionar meta tags dinâmicas para SEO
  useEffect(() => {
    if (post) {
      // Atualizar título da página
      document.title = `${post.title} | BomEstudo`;
      
      // Atualizar meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', post.metaDescription || post.summary);
      
      // Adicionar meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      const keywords = [
        post.category,
        ...(post.tags || []),
        'concurso público', 
        'estudos', 
        'BomEstudo'
      ].join(', ');
      metaKeywords.setAttribute('content', keywords);
      
      // Adicionar Open Graph para compartilhamento em redes sociais
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', post.title);
      
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', post.summary);
      
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage && post.featuredImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
        ogImage.setAttribute('content', post.featuredImage);
      }
    }
    
    // Cleanup function
    return () => {
      document.title = 'BomEstudo';
    };
  }, [post]);
  
  const handleLike = async () => {
    if (!post) return;
    
    try {
      const success = await incrementLikes(post.id);
      if (success) {
        setPost({
          ...post,
          likesCount: post.likesCount + 1
        });
        toast({
          title: "Artigo curtido!",
          description: "Obrigado por curtir este artigo."
        });
      }
    } catch (error) {
      console.error('Erro ao curtir artigo:', error);
      toast({
        title: "Erro ao curtir",
        description: "Não foi possível curtir este artigo. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const handleBookmark = () => {
    if (!post) return;
    
    // Atualizar estado local
    setIsBookmarked(!isBookmarked);
    
    // Atualizar localStorage
    const bookmarkedPosts = JSON.parse(localStorage.getItem('bookmarkedPosts') || '[]');
    
    if (isBookmarked) {
      // Remover dos favoritos
      const updatedBookmarks = bookmarkedPosts.filter((id: string) => id !== post.id);
      localStorage.setItem('bookmarkedPosts', JSON.stringify(updatedBookmarks));
      toast({
        title: "Artigo removido dos favoritos",
        description: "Este artigo foi removido da sua lista de favoritos.",
      });
    } else {
      // Adicionar aos favoritos
      bookmarkedPosts.push(post.id);
      localStorage.setItem('bookmarkedPosts', JSON.stringify(bookmarkedPosts));
      toast({
        title: "Artigo salvo nos favoritos",
        description: "Este artigo foi adicionado à sua lista de favoritos.",
      });
    }
  };
  
  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href,
      })
      .catch((error) => console.log('Erro ao compartilhar', error));
    } else {
      // Fallback para navegadores que não suportam a API Web Share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "O link deste artigo foi copiado para a área de transferência.",
      });
    }
  };
  
  const wrapTablesWithContainer = (content: string) => {
    try {
      // Verifica se o conteúdo é válido
      if (!content || typeof content !== 'string') {
        console.error('Conteúdo inválido:', content);
        return content || '';
      }
      
      // Adicionar o estilo inline ao conteúdo de forma segura
      content = inlineTableStyles + content;
      
      const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/g;
      const tables = content.match(tableRegex);
      
      if (!tables) return content;
      
      // Versão simplificada dos estilos para evitar problemas de parsing
      const tableStyle = `style="font-size:0.65rem;line-height:0.85;border-collapse:collapse;width:100%"`;
      const thTdStyle = `style="padding:0.2rem 0.3rem;font-size:0.65rem;border:1px solid #ddd;vertical-align:top"`;
      
      let newContent = content;
      tables.forEach((table) => {
        try {
          // Adiciona estilo à tag table (versão mais segura)
          let modifiedTable = table.replace(/<table/g, `<table ${tableStyle}`);
          
          // Adiciona estilo a todas as tags td e th
          modifiedTable = modifiedTable.replace(/<td/g, `<td ${thTdStyle}`);
          modifiedTable = modifiedTable.replace(/<th/g, `<th ${thTdStyle}`);
          
          // Embrulha a tabela em um contêiner com overflow-x (versão simplificada)
          const wrapper = `<div class="overflow-x-auto" style="width:100%;overflow-x:auto;display:block">${modifiedTable}</div>`;
          newContent = newContent.replace(table, wrapper);
        } catch (err) {
          console.error('Erro ao processar tabela:', err);
        }
      });
      
      return newContent;
    } catch (error) {
      console.error('Erro ao processar tabelas:', error);
      return content || '';
    }
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <GlobalStyle />
        <main className="container mx-auto px-4 py-12 pt-24 max-w-7xl bg-gray-50">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
            <p className="mb-6">Aguarde um momento enquanto carregamos o artigo.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!post) {
    return (
      <>
        <Header />
        <GlobalStyle />
        <main className="container mx-auto px-4 py-12 pt-24 max-w-7xl bg-gray-50">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
            <p className="mb-6">O artigo que você está procurando não existe ou foi removido.</p>
            <Link to="/blog">
              <Button>Voltar para o Blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <GlobalStyle />
      <main className="container mx-auto px-4 py-12 pt-24 max-w-7xl bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Artigo */}
            <article className="bg-white rounded-lg shadow-sm p-6 mb-8">
              {/* Categoria */}
              <Link 
                to={`/blog/categoria/${post.category?.toLowerCase()}`} 
                className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full mb-4"
              >
                {post.category}
              </Link>
              
              {/* Título */}
              <h1 className="text-3xl font-bold text-[#272f3c] mb-4">{post.title}</h1>
              
              {/* Metadados do post */}
              <div className="flex flex-wrap items-center text-sm text-[#67748a] mb-6">
                <div className="flex items-center mr-6 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  <Link to={`/blog/autor/${encodeURIComponent(post.author.toLowerCase())}`} className="hover:text-primary hover:underline">
                    {post.author}
                  </Link>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(post.createdAt), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{post.readingTime || '5 min de leitura'}</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Heart className="h-4 w-4 mr-2" />
                  <span>{post.likesCount} curtidas</span>
                </div>
              </div>
              
              {/* Imagem destacada */}
              {post.featuredImage && (
                <div className="mb-6">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}
              
              {/* Resumo */}
              <div className="mb-6 text-lg font-medium text-[#67748a] border-l-4 border-primary pl-4 py-2">
                {post.summary}
              </div>
              
              {/* Conteúdo */}
              <div className="mb-8">
                <div 
                  className="prose prose-lg max-w-none overflow-hidden" 
                  style={{ overflowX: 'hidden', maxWidth: '100%' }}
                  dangerouslySetInnerHTML={{ __html: wrapTablesWithContainer(post.content) }}
                />
              </div>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 mb-4">
                  {post.tags.map((tag, index) => (
                    <Link 
                      key={index} 
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-primary/80 to-primary text-white hover:shadow-md transition-all"
                    >
                      <Tag className="w-3.5 h-3.5 mr-1.5" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Ações do post */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200 mb-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLike}
                    className={`flex items-center transition-all duration-300 ${isLiked ? 'text-red-500 border-red-500' : ''}`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-red-500' : ''}`} />
                    {isLiked ? 'Curtido' : 'Curtir'}
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="flex items-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </article>
            
            {/* Posts relacionados */}
            {relatedPostsList.length > 0 && (
              <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">Posts relacionados</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPostsList.map(relatedPost => (
                    <div key={relatedPost.id} className="group">
                      <div className="relative overflow-hidden rounded-lg mb-3">
                        {relatedPost.featuredImage ? (
                          <img 
                            src={relatedPost.featuredImage} 
                            alt={relatedPost.title} 
                            className="w-full h-40 object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md">
                            <BookOpen className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-3 w-full">
                            <span className="text-xs text-white bg-primary/80 px-2 py-1 rounded-full">
                              {relatedPost.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="text-base font-medium text-[#272f3c] group-hover:text-primary line-clamp-2 mb-2 block"
                      >
                        {relatedPost.title}
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {relatedPost.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <Link 
                            to={`/blog/autor/${encodeURIComponent(relatedPost.author.toLowerCase())}`}
                            className="hover:text-primary hover:underline"
                          >
                            {relatedPost.author}
                          </Link>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{relatedPost.readingTime || '5 min'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {/* Informações do autor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Sobre o autor</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-start">
                  {post.authorAvatar ? (
                    <img 
                      src={post.authorAvatar} 
                      alt={post.author} 
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <Link 
                      to={`/blog/autor/${encodeURIComponent(post.author.toLowerCase())}`}
                      className="font-medium hover:text-primary hover:underline block mb-2"
                    >
                      {post.author}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Especialista em concursos públicos e autor de conteúdo no BomEstudo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Posts da mesma categoria */}
            {sameCategoryPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Mais sobre {post.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4">
                    {sameCategoryPosts.map(categoryPost => (
                      <li key={categoryPost.id}>
                        <Link 
                          to={`/blog/${categoryPost.slug}`}
                          className="text-sm font-medium hover:text-primary hover:underline"
                        >
                          {categoryPost.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(categoryPost.createdAt), "dd/MM/yyyy")}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      to={`/blog/categoria/${post.category?.toLowerCase()}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver todos os artigos sobre {post.category}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Últimas notícias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Últimas notícias</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <LatestNews posts={latestPosts} title="" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogPostPage;
