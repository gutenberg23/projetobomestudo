
import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MessageSquare, Heart, Clock, ArrowLeft, Tag, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/components/blog/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow pt-[120px] px-4 md:px-8 w-full">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-6 text-[#67748a] hover:text-[#272f3c]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Blog
          </Button>
          
          <article className="bg-white p-8 rounded-lg shadow-sm" itemScope itemType="https://schema.org/BlogPosting">
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
              {post.tags && post.tags.map(tag => (
                <Link key={tag} to={`/blog/tag/${tag.toLowerCase()}`} className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200">
                  #{tag}
                </Link>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#272f3c] mb-4" itemProp="headline">{post.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-[#67748a] mb-6">
              <span className="mr-4">Por <span itemProp="author">{post.author}</span></span>
              <span className="flex items-center mr-4">
                <Clock className="h-4 w-4 mr-1" />
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
            
            <div className="flex items-center mt-8 pt-6 border-t border-gray-100 text-[#67748a]">
              <div className="flex items-center space-x-6">
                <span className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {post.commentCount} comentários
                </span>
                <span className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  {post.likesCount} curtidas
                </span>
              </div>
            </div>
          </article>
          
          {/* Posts relacionados */}
          {relatedPosts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#272f3c] mb-4">Posts relacionados</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.slug}`}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-[#272f3c] hover:text-[#ea2be2] line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-sm text-[#67748a] mt-2 line-clamp-2">{relatedPost.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
