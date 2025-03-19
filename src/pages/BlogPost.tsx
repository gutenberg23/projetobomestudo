import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { fetchBlogPostBySlug, incrementLikes } from "@/services/blogService";
import { BlogPost as BlogPostType } from "@/components/blog/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentList, CommentForm } from "@/components/blog/comments";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, ThumbsUpIcon } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        if (slug) {
          const postData = await fetchBlogPostBySlug(slug);
          setPost(postData);
        }
      } catch (error) {
        console.error("Erro ao carregar post:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o post. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, toast]);

  const handleLike = async () => {
    if (!post || liked) return;

    try {
      const success = await incrementLikes(post.id);
      if (success) {
        setPost({
          ...post,
          likesCount: post.likesCount + 1
        });
        setLiked(true);
        toast({
          title: "Post curtido",
          description: "Obrigado por curtir este post!"
        });
      }
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  if (loading) {
    return (
      <BlogLayout showSidebar={false} fullWidth={true}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-[400px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </BlogLayout>
    );
  }

  if (!post) {
    return (
      <BlogLayout showSidebar={false} fullWidth={true}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-[#272f3c] mb-4">Post não encontrado</h2>
          <p className="text-[#67748a] mb-6">O post que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Voltar para o blog
            </Link>
          </Button>
        </div>
      </BlogLayout>
    );
  }

  const formattedDate = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <BlogLayout showSidebar={false} fullWidth={true}>
      <div className="bg-[#f6f8fa] max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-[#5f2ebe] hover:text-[#4a1fb0] transition-colors"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Voltar para o blog
          </Link>
        </div>
        
        {post.featuredImage && (
          <div className="relative w-full h-[300px] md:h-[400px] mb-6 rounded-lg overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-[#272f3c]">{post.title}</h1>
            
            <div className="flex flex-wrap items-center text-sm text-[#67748a] gap-3">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>{post.author.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{post.author}</span>
              </div>
              
              {formattedDate && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
              )}
              
              {post.readingTime && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{post.readingTime} min de leitura</span>
                </div>
              )}
              
              {post.category && (
                <div className="bg-[#f0f0f6] px-2 py-1 rounded text-[#5f2ebe]">
                  {post.category}
                </div>
              )}
            </div>
            
            <p className="text-[#67748a] text-lg font-medium">{post.summary}</p>
            
            <div 
              className="prose prose-lg max-w-none text-[#67748a] mt-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="pt-6 flex items-center justify-between border-t border-gray-100 mt-8">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleLike} 
                  disabled={liked}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ThumbsUpIcon className="h-4 w-4" />
                  <span>{post.likesCount}</span>
                </Button>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-[#67748a] px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-xl font-bold text-[#272f3c] mb-4">Comentários ({post.commentCount})</h3>
          <CommentForm 
            postId={post.id}
            onSubmit={async () => {
              // Implementar envio de comentário
              return;
            }}
          />
          <CommentList postId={post.id} />
        </div>
      </div>
    </BlogLayout>
  );
};

export default BlogPost;
