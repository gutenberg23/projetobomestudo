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
  Calendar,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/components/blog/types";
import { MOCK_BLOG_POSTS } from "@/data/blogPosts";
import { LatestNews } from "@/components/blog/LatestNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBlogPostBySlug, fetchBlogPosts, incrementLikes, incrementViewCount } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdBanner from "@/components/ads/AdBanner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePermissions } from "@/hooks/usePermissions";
import { BlogContentWithQuestions } from "@/components/blog/BlogContentWithQuestions";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = usePermissions();

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
        toast({
          title: "Já curtido",
          description: "Você já curtiu este post.",
          variant: "destructive"
        });
        return;
      }

      // Incrementar curtidas
      await incrementLikes(post.id);
      
      // Atualizar estado local
      if (post) {
        setPost({
          ...post,
          likesCount: post.likesCount + 1
        });
      }
      
      // Atualizar localStorage
      likedPosts.push(post.id);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      setIsLiked(true);
      
      toast({
        title: "Curtido!",
        description: "Você curtiu este post."
      });
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && post) {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href
        });
      } else {
        // Copiar URL para a área de transferência
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado!",
          description: "O link do post foi copiado para a área de transferência."
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o post.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Post não encontrado</h1>
                  <p className="text-gray-600 mb-6">O artigo que você está procurando não existe ou foi removido.</p>
                  <Link to="/blog" className="text-primary hover:underline">
                    Voltar para o blog
                  </Link>
                </div>
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
            {/* Banner acima do post */}
            <div className="mb-6">
              <AdBanner position="blog_post_top" className="rounded-lg" />
            </div>
            
            {/* Layout de duas colunas: post principal à esquerda, sidebar à direita */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna principal - post */}
              <div className="lg:col-span-2">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  )}
                  
                  <div className="p-6 md:p-8">
                    <div className="mb-6">
                      {post.category && (
                        <Link 
                          to={`/blog/categoria/${post.category.toLowerCase()}`}
                          className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full hover:bg-primary/20 transition-colors mb-4"
                        >
                          {post.category}
                        </Link>
                      )}
                      
                      <div className="relative">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                          {post.title}
                        </h1>
                        {/* Botão de edição para administradores - na página do post */}
                        {isAdmin() && post.id && (
                          <Link 
                            to={`/admin/posts?edit=${post.id}`} 
                            className="absolute top-0 right-0 bg-[#ea2be2] text-white p-2 rounded-full hover:bg-[#d029d5] transition-colors"
                            title="Editar post"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                          
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                          
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.ceil((typeof post.readingTime === 'string' ? parseInt(post.readingTime) : typeof post.readingTime === 'number' ? post.readingTime : 0) / 60)} min de leitura
                        </div>
                          
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likesCount} curtidas
                        </div>
                          
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {post.viewCount} visualizações
                        </div>
                      </div>
                    </div>
                    
                    {/* Conteúdo do post - usando o componente BlogContentWithQuestions para renderizar questões */}
                    <BlogContentWithQuestions 
                      content={post.content} 
                      className="text-gray-700 mb-8"
                    />
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-8">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map(tag => (
                            <Link
                              key={tag}
                              to={`/blog/tag/${tag.toLowerCase()}`}
                              className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Ações do post */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant={isLiked ? "default" : "outline"}
                          size="sm"
                          onClick={handleLike}
                          className="flex items-center gap-2"
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                          Curtir
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Compartilhar
                        </Button>
                      </div>
                      
                      {post.author && (
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {post.author}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
                
                {/* Banner abaixo do post */}
                <div className="my-8">
                  <AdBanner position="blog_post_bottom" className="rounded-lg" />
                </div>
              </div>
              
              {/* Coluna lateral - posts relacionados */}
              <div className="space-y-8">
                {/* Posts relacionados */}
                {relatedPostsList.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Posts relacionados</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {relatedPostsList.map(relatedPost => (
                          <Link
                            key={relatedPost.id}
                            to={`/blog/${relatedPost.slug}`}
                            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {relatedPost.featuredImage && (
                              <img
                                src={relatedPost.featuredImage}
                                alt={relatedPost.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900 line-clamp-2">
                                {relatedPost.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {format(new Date(relatedPost.createdAt), "dd/MM/yyyy")}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Posts da mesma categoria */}
                {sameCategoryPosts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Mais artigos sobre {post.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {sameCategoryPosts.map(categoryPost => (
                          <Link
                            key={categoryPost.id}
                            to={`/blog/${categoryPost.slug}`}
                            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {categoryPost.featuredImage && (
                              <img
                                src={categoryPost.featuredImage}
                                alt={categoryPost.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900 line-clamp-2">
                                {categoryPost.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {format(new Date(categoryPost.createdAt), "dd/MM/yyyy")}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
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
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default BlogPostPage;