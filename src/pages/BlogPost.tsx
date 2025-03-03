
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

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Encontrar o post com base no slug
  const post = MOCK_BLOG_POSTS.find(post => post.slug === slug);
  
  // Encontrar posts relacionados - na mesma categoria ou com tags em comum
  const relatedPosts = post 
    ? MOCK_BLOG_POSTS.filter(p => 
        p.id !== post.id && 
        (p.category === post.category || 
          (p.tags && post.tags && p.tags.some(tag => post.tags?.includes(tag))))
      ).slice(0, 3) 
    : [];
  
  // Posts da mesma categoria
  const sameCategoryPosts = post
    ? MOCK_BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category).slice(0, 4)
    : [];
  
  // Posts mais recentes
  const latestPosts = [...MOCK_BLOG_POSTS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(p => p.id !== post?.id)
    .slice(0, 5);
  
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
      ogDescription.setAttribute('content', post.metaDescription || post.summary);
      
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', `https://bomestudo.com.br/blog/${post.slug}`);
      
      let ogType = document.querySelector('meta[property="og:type"]');
      if (!ogType) {
        ogType = document.createElement('meta');
        ogType.setAttribute('property', 'og:type');
        document.head.appendChild(ogType);
      }
      ogType.setAttribute('content', 'article');
      
      // Limpar as meta tags quando o componente for desmontado
      return () => {
        document.title = 'BomEstudo';
      };
    }
  }, [post]);
  
  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
        <Header />
        <main className="flex-grow pt-[120px] px-4 md:px-8 w-full max-w-3xl mx-auto text-center">
          <h1 className="text-3xl mb-6 font-extrabold text-[#272f3c]">Artigo não encontrado</h1>
          <p className="text-[#67748a] mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/blog')} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm");
  
  // Dividir o conteúdo em parágrafos para melhor formatação
  const paragraphs = post.content.split('\n\n');
  
  // Calcular tempo de leitura estimado se não estiver definido
  const readingTime = post.readingTime || Math.ceil(post.content.split(' ').length / 200);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-6 text-[#67748a] hover:text-[#272f3c]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Blog
            </Button>
            
            <article className="bg-white p-6 md:p-8 rounded-lg shadow-sm" itemScope itemType="https://schema.org/BlogPosting">
              {/* Elementos de Schema.org para SEO */}
              <meta itemProp="datePublished" content={post.createdAt} />
              <meta itemProp="author" content={post.author} />
              <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                <meta itemProp="name" content="BomEstudo" />
                <meta itemProp="url" content="https://bomestudo.com.br" />
              </div>
              
              {/* Categorias e tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Link to={`/blog/categoria/${post.category.toLowerCase()}`} className="text-xs font-medium bg-[#fce7fc] text-[#ea2be2] px-2.5 py-1 rounded-full hover:bg-[#f9d0f9]">
                  {post.category}
                </Link>
                {post.region && (
                  <Link to={`/blog/regiao/${post.region.toLowerCase()}`} className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200">
                    {post.region}
                  </Link>
                )}
                {post.state && (
                  <Link to={`/blog/estado/${post.state.toLowerCase()}`} className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200">
                    {post.state}
                  </Link>
                )}
                {post.tags && post.tags.map(tag => (
                  <Link key={tag} to={`/blog/tag/${tag.toLowerCase()}`} className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200">
                    #{tag}
                  </Link>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#272f3c] mb-6" itemProp="headline">{post.title}</h1>
              
              {/* Imagem do post */}
              {post.featuredImage && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-auto object-cover" 
                    itemProp="image"
                  />
                </div>
              )}
              
              <div className="flex flex-wrap items-center text-sm text-[#67748a] mb-6 gap-y-2">
                <div className="flex items-center mr-6">
                  {post.authorAvatar ? (
                    <img 
                      src={post.authorAvatar} 
                      alt={post.author} 
                      className="h-8 w-8 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 mr-2" />
                  )}
                  <span itemProp="author">{post.author}</span>
                </div>
                <span className="flex items-center mr-6">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  {readingTime} min de leitura
                </span>
              </div>
              
              <div className="prose max-w-none text-[#67748a]" itemProp="articleBody">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              <div className="flex items-center flex-wrap mt-8 pt-6 border-t border-gray-100 gap-3">
                <Button
                  variant="outline"
                  onClick={handleLike}
                  className="flex items-center"
                >
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-[#ea2be2] text-[#ea2be2]' : ''}`} />
                  {post.likesCount + (isLiked ? 1 : 0)} curtidas
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  className="flex items-center"
                >
                  <Bookmark className={`h-5 w-5 mr-2 ${isBookmarked ? 'fill-[#ea2be2] text-[#ea2be2]' : ''}`} />
                  Salvar
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Compartilhar
                </Button>
                
                <span className="flex items-center ml-auto">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {post.commentCount} comentários
                </span>
              </div>
            </article>
            
            {/* Posts relacionados */}
            {relatedPosts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#272f3c] mb-4">Posts relacionados</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedPosts.map(relatedPost => (
                    <BlogPostCard 
                      key={relatedPost.id} 
                      post={relatedPost} 
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Posts da mesma categoria */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-[#ea2be2]" />
                  Mais em {post.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <LatestNews 
                  posts={sameCategoryPosts}
                  title="" 
                  viewAllLink={`/blog/categoria/${post.category.toLowerCase()}`}
                />
              </CardContent>
            </Card>
            
            {/* Posts mais recentes */}
            <SidebarPosts
              posts={latestPosts}
              title="Últimos posts"
              icon={<Clock className="h-5 w-5 mr-2 text-[#ea2be2]" />}
            />
            
            {/* Próximos concursos */}
            <Card>
              <CardHeader className="bg-[#fce7fc]/50 pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-[#ea2be2]" />
                  Próximos concursos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <LatestNews 
                  posts={MOCK_BLOG_POSTS.filter(p => p.category === "Concursos").slice(0, 4)}
                  title="" 
                  viewAllLink="/blog/categoria/concursos"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
