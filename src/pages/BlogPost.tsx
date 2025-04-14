import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  Heart, 
  Clock, 
  BookOpen, 
  Share2, 
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/components/blog/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { LatestNews } from "@/components/blog/LatestNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBlogPostBySlug, fetchBlogPosts, incrementLikes, incrementViewCount } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
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
        console.log('Carregando post com slug:', slug);
        // Buscar o post específico
        const fetchedPost = await fetchBlogPostBySlug(slug);
        console.log('Post carregado:', fetchedPost);
        
        if (!fetchedPost) {
          setLoading(false);
          return;
        }
        
        setPost(fetchedPost);

        // Incrementar a contagem de visualizações
        if (fetchedPost.id) {
          await incrementViewCount(fetchedPost.id);
        }

        // Buscar todos os posts para relacionados
        const posts = await fetchBlogPosts();
        setAllPosts(posts.length > 0 ? posts : MOCK_BLOG_POSTS);
        
        // Verificar se o post está curtido
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        const hasLiked = likedPosts.includes(fetchedPost.id);
        console.log('Verificação de curtida:', { postId: fetchedPost.id, likedPosts, hasLiked });
        setIsLiked(hasLiked);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar post:', error);
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
    try {
      // Verificar a sessão atual
      const session = await supabase.auth.getSession();
      console.log('Estado da sessão:', {
        hasSession: !!session.data.session,
        userId: session.data.session?.user?.id,
        isExpired: session.data.session?.expires_at ? new Date(session.data.session.expires_at * 1000) < new Date() : true
      });

      // Verificar se o usuário está autenticado
      if (!session.data.session?.user) {
        console.error('Usuário não está autenticado');
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para curtir um post.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o post existe e tem ID válido
      if (!post?.id) {
        console.error('Post inválido ou sem ID');
        toast({
          title: "Erro ao curtir",
          description: "Não foi possível curtir o post: post inválido",
          variant: "destructive"
        });
        return;
      }

      // Verificar se já curtiu
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      if (likedPosts.includes(post.id)) {
        console.log('Post já foi curtido');
        toast({
          title: "Post já curtido",
          description: "Você já curtiu este post anteriormente.",
          variant: "default"
        });
        return;
      }

      console.log('Detalhes do post antes de curtir:', {
        postId: post.id,
        currentLikes: post.likesCount,
        title: post.title
      });

      // Tentar incrementar as curtidas
      const success = await incrementLikes(post.id);
      console.log('Resultado da curtida:', success);

      if (success) {
        // Atualizar o estado local
        setPost(prev => prev ? {
          ...prev,
          likesCount: (prev.likesCount || 0) + 1
        } : null);
        
        // Atualizar o localStorage
        likedPosts.push(post.id);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        setIsLiked(true);

        toast({
          title: "Post curtido!",
          description: "Post curtido com sucesso!",
          variant: "default"
        });
      } else {
        console.error('Falha ao curtir post - verificando motivos:');
        
        // Verificar novamente a sessão para ter certeza que não expirou durante a operação
        const currentSession = await supabase.auth.getSession();
        if (!currentSession.data.session) {
          console.error('Sessão expirou durante a operação');
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive"
          });
          return;
        }

        // Se chegou aqui, é um erro genérico
        console.error('Falha ao curtir post - erro desconhecido');
        toast({
          title: "Erro ao curtir",
          description: "Não foi possível curtir o post. Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao processar curtida:', error);
      toast({
        title: "Erro ao curtir",
        description: "Ocorreu um erro ao curtir o post",
        variant: "destructive"
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
  
  if (loading) {
    return (
      <>
        <Header />
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
      <main className="container mx-auto px-4 py-12 pt-12 max-w-7xl bg-gray-50">
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
              
              {/* Conteúdo do post */}
              <div className="prose prose-lg max-w-none mt-8">
                <style>
                  {`
                    .prose h1 { font-size: 2.5em; margin-top: 1.5em; margin-bottom: 0.8em; }
                    .prose h2 { font-size: 2em; margin-top: 1.4em; margin-bottom: 0.7em; }
                    .prose h3 { font-size: 1.7em; margin-top: 1.3em; margin-bottom: 0.6em; }
                    .prose h4 { font-size: 1.4em; margin-top: 1.2em; margin-bottom: 0.5em; }
                    .prose h5 { font-size: 1.2em; margin-top: 1.1em; margin-bottom: 0.4em; }
                    
                    .prose ul {
                      list-style-type: disc;
                      margin-top: 1.25em;
                      margin-bottom: 1.25em;
                      padding-left: 1.625em;
                    }
                    
                    .prose ul li {
                      margin-top: 0.5em;
                      margin-bottom: 0.5em;
                      padding-left: 0.375em;
                    }
                    
                    .prose ol {
                      list-style-type: decimal;
                      margin-top: 1.25em;
                      margin-bottom: 1.25em;
                      padding-left: 1.625em;
                    }
                    
                    .prose ol li {
                      margin-top: 0.5em;
                      margin-bottom: 0.5em;
                      padding-left: 0.375em;
                    }
                    
                    .prose table {
                      display: table;
                      width: 100%;
                      table-layout: auto;
                      overflow-x: auto;
                      font-size: 0.9em;
                      margin: 1em 0;
                      border-collapse: collapse;
                    }

                    /* Wrapper para scroll horizontal */
                    .prose table:not(.no-wrap) {
                      display: block;
                      max-width: 100%;
                      overflow-x: auto;
                      -webkit-overflow-scrolling: touch;
                    }
                    
                    .prose table td {
                      padding: 0.75em 1em;
                      border: 1px solid #e2e8f0;
                      min-width: 80px;
                      max-width: 300px;
                      word-wrap: break-word;
                      overflow-wrap: break-word;
                      hyphens: auto;
                    }
                    
                    .prose table th {
                      padding: 0.75em 1em;
                      border: 1px solid #e2e8f0;
                      background-color: #f8fafc;
                      font-weight: 600;
                      text-align: left;
                      white-space: normal;
                      min-width: 80px;
                      max-width: 300px;
                    }

                    /* Tenta fazer células se ajustarem ao conteúdo */
                    .prose table td, .prose table th {
                      width: 1%;
                      white-space: normal;
                    }

                    /* Se a tabela tiver muitas colunas, permite scroll */
                    .prose table.wide {
                      white-space: nowrap;
                    }
                    
                    .prose table::-webkit-scrollbar {
                      height: 8px;
                    }
                    
                    .prose table::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 4px;
                    }
                    
                    .prose table::-webkit-scrollbar-thumb {
                      background: #888;
                      border-radius: 4px;
                    }
                    
                    .prose table::-webkit-scrollbar-thumb:hover {
                      background: #555;
                    }
                    
                    .prose table tr:nth-child(even) {
                      background-color: #fafafa;
                    }
                    
                    .prose table tr:hover {
                      background-color: #f1f5f9;
                    }
                  `}
                </style>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 mb-6">
                  {post.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Ações do post */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <Button 
                    variant={isLiked ? "default" : "outline"}
                    size="sm" 
                    onClick={handleLike}
                    className={`flex items-center transition-all duration-200 ${
                      isLiked 
                        ? 'bg-red-500 hover:bg-red-500 text-white border-red-500 cursor-not-allowed' 
                        : 'hover:text-red-500 hover:border-red-500'
                    }`}
                    disabled={!user || isLiked}
                  >
                    <Heart className={`h-4 w-4 mr-2 transition-all ${isLiked ? 'fill-white' : 'fill-none'}`} />
                    {isLiked ? 'Você curtiu' : 'Curtir'}
                  </Button>
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
